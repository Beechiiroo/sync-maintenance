import uuid
from django.db import models
from django.conf import settings

EQUIPMENT_STATUS = [(s,s) for s in ["operational","maintenance","critical","warning","decommissioned"]]

class Equipment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default="general")
    status = models.CharField(max_length=20, choices=EQUIPMENT_STATUS, default="operational")
    location = models.CharField(max_length=255, default="")
    manufacturer = models.CharField(max_length=255, null=True, blank=True)
    model = models.CharField(max_length=255, null=True, blank=True)
    serial_number = models.CharField(max_length=255, null=True, blank=True)
    image_url = models.TextField(null=True, blank=True)
    health_score = models.IntegerField(null=True, blank=True, default=100)
    mtbf_hours = models.IntegerField(null=True, blank=True)
    last_maintenance = models.DateTimeField(null=True, blank=True)
    next_maintenance = models.DateTimeField(null=True, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    warranty_expires = models.DateField(null=True, blank=True)
    specifications = models.JSONField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
