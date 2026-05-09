from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/", include("apps.equipment.urls")),
    path("api/", include("apps.interventions.urls")),
    path("api/", include("apps.inventory.urls")),
    path("api/", include("apps.maintenance.urls")),
    path("api/", include("apps.tickets.urls")),
    path("api/", include("apps.contracts.urls")),
    path("api/", include("apps.notifications.urls")),
    path("api/", include("apps.messaging.urls")),
    path("api/", include("apps.audit.urls")),
    path("api/ai/", include("apps.ai.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
