from rest_framework import serializers, viewsets
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .models import Equipment

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = "__all__"

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by("-created_at")
    serializer_class = EquipmentSerializer
    filterset_fields = ["status","category","location"]
    search_fields = ["name","serial_number","manufacturer","model"]
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
