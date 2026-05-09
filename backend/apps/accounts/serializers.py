from rest_framework import serializers
from .models import User, Profile, UserRole

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id","email","full_name","is_active","created_at"]

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id","email","full_name","avatar_url","role","created_at","updated_at"]

class UserRoleSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    class Meta:
        model = UserRole
        fields = ["id","user_id","role"]

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=[c[0] for c in [("admin","admin"),("technician","technician"),("assistant","assistant"),("client","client")]], required=False, default="client")

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
