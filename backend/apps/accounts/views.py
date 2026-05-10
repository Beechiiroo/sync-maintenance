from django.contrib.auth import authenticate
from django.middleware.csrf import get_token
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Profile, UserRole
from .serializers import (UserSerializer, ProfileSerializer, UserRoleSerializer,
                          RegisterSerializer, LoginSerializer)


def _tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class LoginThrottle(ScopedRateThrottle):
    scope = "login"


class RegisterThrottle(ScopedRateThrottle):
    scope = "register"


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    """Issue a CSRF token cookie for the SPA."""
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([RegisterThrottle])
def register(request):
    s = RegisterSerializer(data=request.data); s.is_valid(raise_exception=True)
    if User.objects.filter(email__iexact=s.validated_data["email"]).exists():
        return Response({"detail": "Email already registered"}, status=400)
    user = User.objects.create_user(**s.validated_data)
    return Response({**_tokens(user), "user": UserSerializer(user).data}, status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def login(request):
    s = LoginSerializer(data=request.data); s.is_valid(raise_exception=True)
    user = authenticate(request, username=s.validated_data["email"], password=s.validated_data["password"])
    if not user:
        # Constant-time generic message: avoid user enumeration
        return Response({"detail": "Invalid credentials"}, status=401)
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
    return Response({"detail": "ok"})


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see/edit their own profile (admins see all)
        qs = super().get_queryset()
        u = self.request.user
        if u.is_staff or u.is_superuser:
            return qs
        return qs.filter(user=u)


class UserRoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        if u.is_staff or u.is_superuser:
            return qs
        return qs.filter(user=u)
