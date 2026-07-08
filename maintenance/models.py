from django.db import models
from django.conf import settings
from properties.models import Room, Property

class MaintenanceRequest(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN'
        IN_PROGRESS = 'IN_PROGRESS'
        RESOLVED = 'RESOLVED'

    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True, blank=True, related_name='maintenance_requests')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, null=True, blank=True, related_name='maintenance_requests')
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reported_issues')
    description = models.TextField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Maintenance #{self.id} - {self.status}"