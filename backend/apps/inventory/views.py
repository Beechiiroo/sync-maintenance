from rest_framework import serializers, viewsets
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .models import SparePart, StockMovement

class SparePartSerializer(serializers.ModelSerializer):
    class Meta: model = SparePart; fields = "__all__"

class StockMovementSerializer(serializers.ModelSerializer):
    spare_part_id = serializers.PrimaryKeyRelatedField(source="spare_part", queryset=SparePart.objects.all())
    intervention_id = serializers.PrimaryKeyRelatedField(
        source="intervention",
        queryset=__import__("apps.interventions.models", fromlist=["Intervention"]).Intervention.objects.all(),
        required=False, allow_null=True,
    )
    class Meta:
        model = StockMovement
        exclude = ("spare_part","intervention")

class SparePartViewSet(viewsets.ModelViewSet):
    queryset = SparePart.objects.all().order_by("-created_at")
    serializer_class = SparePartSerializer
    filterset_fields = ["status","category"]
    search_fields = ["name","reference"]

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all().order_by("-created_at")
    serializer_class = StockMovementSerializer
    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)

router = DefaultRouter()
router.register("spare-parts", SparePartViewSet)
router.register("stock-movements", StockMovementViewSet)
