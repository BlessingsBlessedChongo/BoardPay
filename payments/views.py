from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Payment
from .serializers import PaymentSerializer
from .ocr import check_reference
from .blockchain import log_payment_to_chain
from .gemini_service import extract_receipt_data
from users.permissions import IsStudent, IsCaretakerOrLandlord


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
        elif self.action == 'upload':
            # Only students can upload receipts
            permission_classes = [permissions.IsAuthenticated, IsStudent]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Student uploads a receipt; it goes straight to PENDING for review.
        payment = serializer.save(status=Payment.Status.PENDING)

        # Run OCR to cross-check the entered transaction reference against
        # what's actually printed on the receipt image. This doesn't block
        # submission either way - it just flags a mismatch for the caretaker.
        ocr_match = check_reference(payment.receipt_image.path, payment.transaction_ref)
        if ocr_match != payment.ocr_match:
            payment.ocr_match = ocr_match
            payment.save(update_fields=['ocr_match'])

    @action(detail=False, methods=['post'], parser_classes=(MultiPartParser, FormParser))
    def upload(self, request):
        """
        POST /api/payments/upload/
        Accept a multipart file upload, extract data via Gemini OCR, and return extracted info.
        """
        if 'file' not in request.FILES:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        uploaded_file = request.FILES['file']
        
        # Save temporarily to extract data
        import tempfile
        import shutil
        
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                for chunk in uploaded_file.chunks():
                    tmp_file.write(chunk)
                tmp_file_path = tmp_file.name
            
            # Extract receipt data using Gemini
            extracted_data = extract_receipt_data(tmp_file_path)
            
            # Clean up temp file
            try:
                import os
                os.unlink(tmp_file_path)
            except:
                pass
            
            if extracted_data is None:
                return Response(
                    {"error": "Failed to extract receipt data. Please try again."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            return Response(
                {
                    "success": True,
                    "extracted_data": extracted_data,
                    "message": "Receipt data extracted successfully"
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            print(f"[PaymentUpload] Error: {e}")
            return Response(
                {"error": f"Upload failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=['patch'])
    def verify(self, request, pk=None):
        payment = self.get_object()
        action_value = request.data.get('action')

        if action_value not in ['approve', 'reject']:
            return Response(
                {"error": "action must be 'approve' or 'reject'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if payment.status != Payment.Status.PENDING:
            return Response(
                {"error": "Payment is not pending"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action_value == 'approve':
            payment.status = Payment.Status.VERIFIED
            payment.verified_by = request.user
            payment.save()

            # Log the verified payment on-chain for an immutable audit trail.
            # A blockchain hiccup (e.g. Hardhat node not running) should not
            # prevent the caretaker from completing verification - we just
            # log the error and leave blockchain_tx_hash blank so it can be
            # retried/backfilled later.
            try:
                tx_hash = log_payment_to_chain(payment.id)
                payment.blockchain_tx_hash = tx_hash
                payment.save(update_fields=['blockchain_tx_hash'])
            except Exception as exc:  # noqa: BLE001 - deliberately broad, see docstring above
                print(f"[blockchain] Failed to log payment {payment.id}: {exc}")

            return Response(PaymentSerializer(payment).data)

        else:  # reject
            payment.status = Payment.Status.REJECTED
            payment.verified_by = request.user
            payment.rejection_reason = request.data.get('reason', '')
            payment.save()
            return Response(PaymentSerializer(payment).data)
