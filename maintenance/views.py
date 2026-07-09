from rest_framework import viewsets, permissions
from .models import MaintenanceRequest
from .serializers import MaintenanceSerializer
from users.permissions import IsStudent, IsCaretakerOrLandlord


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for maintenance requests.
    Students can create and view, caretakers/landlords can update status.
    """
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter maintenance requests based on user role."""
        user = self.request.user
        if user.role == 'STUDENT':
            # Students see only their room's maintenance requests
            return MaintenanceRequest.objects.filter(reported_by=user)
        elif user.role in ['CARETAKER', 'LANDLORD']:
            # Caretakers/landlords see requests for their assigned properties
            return MaintenanceRequest.objects.filter(
                property__in=user.assigned_properties.all()
            ) | MaintenanceRequest.objects.filter(
                property__landlord=user
            )
        return MaintenanceRequest.objects.none()

    def perform_create(self, serializer):
        """Create maintenance request and associate with current user."""
        serializer.save(reported_by=self.request.user)

