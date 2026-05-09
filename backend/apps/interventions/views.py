from rest_framework import serializers, viewsets
from .models import Intervention

class InterventionSerializer(serializers.ModelSerializer):
    equipment_id = serializers.PrimaryKeyRelatedField(
        source="equipment", queryset=__import__("apps.equipment.models", fromlist=["Equipment"]).Equipment.objects.all(),
        required=False, allow_null=True
    )
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=__import__("apps.accounts.models", fromlist=["User"]).User.objects.all(),
        required=False, allow_null=True
    )
    class Meta:
        model = Intervention
        exclude = ("equipment",)

class InterventionViewSet(viewsets.ModelViewSet):
    queryset = Intervention.objects.all().order_by("-created_at")
    serializer_class = InterventionSerializer
    filterset_fields = ["status","type","priority","assigned_to"]
    search_fields = ["title","description"]
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
