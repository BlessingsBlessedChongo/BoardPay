from django.conf import settings
from django.db import models


class Property(models.Model):
    """A boarding house / building owned by a landlord."""

    name = models.CharField(max_length=255)
    address = models.TextField()
    landlord = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_properties',
    )
    caretakers = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='assigned_properties',
        blank=True,
    )

    def __str__(self):
        return self.name


class Room(models.Model):
    """A rentable room within a Property."""

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='rooms')
    number = models.CharField(max_length=20)
    capacity = models.IntegerField(default=1)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('property', 'number')

    def __str__(self):
        return f"{self.property.name} - Room {self.number}"


class Lease(models.Model):
    """A student's lease agreement for a Room."""

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='leases')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leases',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Lease #{self.id} - {self.student.username} - {self.room}"
