from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("csrf/", views.csrf),
    path("login/", views.login),
    path("register/", views.register),
    path("me/", views.me),
    path("logout/", views.logout),
    path("token/refresh/", TokenRefreshView.as_view()),
]

# Mounted at /api/ for frontend compatibility (profiles/, user-roles/)
profiles_router = DefaultRouter()
profiles_router.register("profiles", views.ProfileViewSet, basename="profile")
profiles_router.register("user-roles", views.UserRoleViewSet, basename="user-role")
profiles_urlpatterns = profiles_router.urls
