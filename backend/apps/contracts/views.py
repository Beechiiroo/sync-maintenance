from rest_framework import serializers, viewsets
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .models import Contract

class ContractSerializer(serializers.ModelSerializer):
    class Meta: model = Contract; fields = "__all__"

class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all().order_by("-created_at")
    serializer_class = ContractSerializer
    filterset_fields = ["status","type","supplier"]
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

router = DefaultRouter()
router.register("contracts", ContractViewSet)
