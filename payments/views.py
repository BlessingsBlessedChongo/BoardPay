from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
from users.permissions import IsStudent, IsCaretakerOrLandlord
from .tasks import log_payment_to_chain

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def get_permissions(self):
        if self.action == 'create':
            # Only students can submit payments
            permission_classes = [permissions.IsAuthenticated, IsStudent]
        elif self.action == 'verify':
            # Only caretakers/landlords can verify
            permission_classes = [permissions.IsAuthenticated, IsCaretakerOrLandlord]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Student uploads receipt; set status to PENDING automatically
        serializer.save(status=Payment.Status.PENDING)

    @action(detail=True, methods=['patch'])
    def verify(self, request, pk=None):
        payment = self.get_object()
        action = request.data.get('action')
        if action not in ['approve', 'reject']:
            return Response({"error": "action must be 'approve' or 'reject'"}, status=status.HTTP_400_BAD_REQUEST)

        if payment.status != Payment.Status.PENDING:
            return Response({"error": "Payment is not pending"}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'approve':
            payment.status = Payment.Status.VERIFIED
            payment.verified_by = request.user
            # TODO: Trigger blockchain transaction here (Phase 3)
            payment.save()
            # dispatch blockchain task
            log_payment_to_chain.delay(payment.id)
            return Response(PaymentSerializer(payment).data)
        else:  # reject
            payment.status = Payment.Status.REJECTED
            payment.verified_by = request.user
            payment.rejection_reason = request.data.get('reason', '')
            payment.save()
            return Response(PaymentSerializer(payment).data)