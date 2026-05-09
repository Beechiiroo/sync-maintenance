from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register("profiles", views.ProfileViewSet, basename="profile")
router.register("user-roles", views.UserRoleViewSet, basename="user-role")

urlpatterns = [
    path("login/", views.login),
    path("register/", views.register),
    path("me/", views.me),
    path("logout/", views.logout),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("", include(router.urls)),  # exposed under /api/auth/profiles & /api/auth/user-roles
]
