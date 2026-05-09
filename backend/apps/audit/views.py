from rest_framework import serializers, viewsets, mixins
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(read_only=True)
    class Meta:
        model = AuditLog
        fields = ["id","user_id","module","action","details","ip_address","metadata","created_at"]
        read_only_fields = ["id","created_at","user_id","ip_address"]

class AuditLogViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = AuditLog.objects.all().order_by("-created_at")
    serializer_class = AuditLogSerializer
    filterset_fields = ["module","action"]
    def perform_create(self, serializer):
        ip = self.request.META.get("HTTP_X_FORWARDED_FOR","").split(",")[0] or self.request.META.get("REMOTE_ADDR")
        serializer.save(user=self.request.user, ip_address=ip)

router = DefaultRouter()
router.register("audit-logs", AuditLogViewSet)
