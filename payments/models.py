from django.db import models
from django.conf import settings
from properties.models import Lease

class Payment(models.Model):
    class Status(models.TextChoices):
        UNPAID = 'UNPAID'
        PENDING = 'PENDING'
        VERIFIED = 'VERIFIED'
        REJECTED = 'REJECTED'

    lease = models.ForeignKey(Lease, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_ref = models.CharField(max_length=100)
    receipt_image = models.ImageField(upload_to='receipts/')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UNPAID)
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='verified_payments')
    blockchain_tx_hash = models.CharField(max_length=66, blank=True, null=True)  # future use
    rejection_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Payment {self.id} - {self.lease.student.username} - {self.status}"