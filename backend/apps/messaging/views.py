from rest_framework import serializers, viewsets
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from django.db.models import Q
from .models import Message
from apps.accounts.models import User

class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.PrimaryKeyRelatedField(source="sender", queryset=User.objects.all(), required=False)
    receiver_id = serializers.PrimaryKeyRelatedField(source="receiver", queryset=User.objects.all())
    class Meta:
        model = Message
        exclude = ("sender","receiver")

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    def get_queryset(self):
        u = self.request.user
        return Message.objects.filter(Q(sender=u) | Q(receiver=u)).order_by("-created_at")
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

router = DefaultRouter()
router.register("messages", MessageViewSet, basename="message")
