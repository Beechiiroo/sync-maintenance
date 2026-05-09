import uuid
from django.db import models
from django.conf import settings

C_STATUS = [(s,s) for s in ["active","expiring","expired","cancelled"]]
C_TYPE = [(s,s) for s in ["maintenance","service","warranty","lease"]]

class Contract(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    supplier = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=C_TYPE, default="maintenance")
    status = models.CharField(max_length=20, choices=C_STATUS, default="active")
    start_date = models.DateField()
    end_date = models.DateField()
    value = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    sla_response_hours = models.IntegerField(null=True, blank=True)
    sla_resolution_hours = models.IntegerField(null=True, blank=True)
    penalties = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True, default=0)
    compliance_score = models.IntegerField(null=True, blank=True, default=100)
    document_url = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
