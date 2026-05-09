from rest_framework import serializers, viewsets
from .models import Intervention

class InterventionSerializer(serializers.ModelSerializer):
    equipment_id = serializers.UUIDField(source="equipment_id", required=False, allow_null=True)
    class Meta:
        model = Intervention
        fields = "__all__"
        extra_kwargs = {"equipment": {"required": False, "allow_null": True}}

class InterventionViewSet(viewsets.ModelViewSet):
    queryset = Intervention.objects.all().order_by("-created_at")
    serializer_class = InterventionSerializer
    filterset_fields = ["status","type","priority","equipment","assigned_to"]
    search_fields = ["title","description"]
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
