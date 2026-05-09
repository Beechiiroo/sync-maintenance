import uuid
from django.db import models
from django.conf import settings
from apps.equipment.models import Equipment

INT_STATUS = [(s,s) for s in ["planned","in_progress","completed","cancelled"]]
INT_PRIORITY = [(s,s) for s in ["low","medium","high","critical"]]
INT_TYPE = [(s,s) for s in ["preventive","corrective","predictive","emergency"]]

class Intervention(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=20, choices=INT_TYPE, default="corrective")
    status = models.CharField(max_length=20, choices=INT_STATUS, default="planned")
    priority = models.CharField(max_length=20, choices=INT_PRIORITY, default="medium")
    equipment = models.ForeignKey(Equipment, null=True, blank=True, on_delete=models.SET_NULL, related_name="interventions")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_interventions")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_interventions")
    scheduled_date = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)
    notes = models.TextField(null=True, blank=True)
    photos = models.JSONField(null=True, blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
