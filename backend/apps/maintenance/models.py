import uuid
from django.db import models
from django.conf import settings
from apps.equipment.models import Equipment

FREQ = [(s,s) for s in ["daily","weekly","biweekly","monthly","quarterly","semi_annual","annual"]]

class MaintenanceSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name="schedules")
    task = models.CharField(max_length=255)
    frequency = models.CharField(max_length=20, choices=FREQ, default="monthly")
    next_due = models.DateTimeField()
    last_performed = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default="pending")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
