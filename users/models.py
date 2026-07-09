from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT'
        CARETAKER = 'CARETAKER'
        LANDLORD = 'LANDLORD'
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    payment_streak = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.username} ({self.role})"