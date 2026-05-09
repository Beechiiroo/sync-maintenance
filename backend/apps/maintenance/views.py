from rest_framework import serializers, viewsets
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .models import MaintenanceSchedule
from apps.equipment.models import Equipment

class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    equipment_id = serializers.PrimaryKeyRelatedField(source="equipment", queryset=Equipment.objects.all())
    class Meta:
        model = MaintenanceSchedule
        exclude = ("equipment",)

class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceSchedule.objects.all().order_by("next_due")
    serializer_class = MaintenanceScheduleSerializer
    filterset_fields = ["status","frequency","assigned_to"]

router = DefaultRouter()
router.register("maintenance-schedules", MaintenanceScheduleViewSet)
