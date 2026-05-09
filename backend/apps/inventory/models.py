import uuid
from django.db import models
from django.conf import settings
from apps.interventions.models import Intervention

STOCK_STATUS = [(s,s) for s in ["ok","low","critical","out_of_stock"]]
MOVEMENT_TYPE = [(s,s) for s in ["in","out","adjustment"]]

class SparePart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    reference = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    quantity = models.IntegerField(default=0)
    min_stock = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    supplier = models.CharField(max_length=255, null=True, blank=True)
    image_url = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STOCK_STATUS, default="ok")
    compatible_equipment = models.JSONField(null=True, blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class StockMovement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    spare_part = models.ForeignKey(SparePart, on_delete=models.CASCADE, related_name="movements")
    intervention = models.ForeignKey(Intervention, null=True, blank=True, on_delete=models.SET_NULL)
    type = models.CharField(max_length=20, choices=MOVEMENT_TYPE)
    quantity = models.IntegerField()
    notes = models.TextField(null=True, blank=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
