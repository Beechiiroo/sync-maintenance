from rest_framework import serializers, viewsets
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(read_only=True)
    class Meta:
        model = Notification
        fields = ["id","user_id","title","message","type","link","read","metadata","created_at"]
        read_only_fields = ["id","created_at","user_id"]

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    filterset_fields = ["read","type"]
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

router = DefaultRouter()
router.register("notifications", NotificationViewSet, basename="notification")
