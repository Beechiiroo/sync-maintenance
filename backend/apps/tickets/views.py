from rest_framework import serializers, viewsets
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .models import Ticket
from apps.equipment.models import Equipment

class TicketSerializer(serializers.ModelSerializer):
    equipment_id = serializers.PrimaryKeyRelatedField(source="equipment", queryset=Equipment.objects.all(), required=False, allow_null=True)
    class Meta:
        model = Ticket
        exclude = ("equipment",)

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by("-created_at")
    serializer_class = TicketSerializer
    filterset_fields = ["status","priority","assigned_to"]
    search_fields = ["title","description"]
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

router = DefaultRouter()
router.register("tickets", TicketViewSet)
