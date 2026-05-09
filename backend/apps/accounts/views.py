from django.contrib.auth import authenticate
from rest_framework import status, viewsets, mixins, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .models import User, Profile, UserRole
from .serializers import (UserSerializer, ProfileSerializer, UserRoleSerializer,
                          RegisterSerializer, LoginSerializer)

def _tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    s = RegisterSerializer(data=request.data); s.is_valid(raise_exception=True)
    if User.objects.filter(email=s.validated_data["email"]).exists():
        return Response({"detail":"Email already registered"}, status=400)
    user = User.objects.create_user(**s.validated_data)
    return Response({**_tokens(user), "user": UserSerializer(user).data}, status=201)

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    s = LoginSerializer(data=request.data); s.is_valid(raise_exception=True)
    user = authenticate(request, username=s.validated_data["email"], password=s.validated_data["password"])
    if not user:
        return Response({"detail":"Invalid credentials"}, status=401)
    return Response({**_tokens(user), "user": UserSerializer(user).data})

@api_view(["GET"])
def me(request):
    return Response(UserSerializer(request.user).data)

@api_view(["POST"])
def logout(request):
    try:
        token = RefreshToken(request.data.get("refresh"))
        token.blacklist()
    except Exception:
        pass
    return Response({"detail":"ok"})

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

class UserRoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated]
