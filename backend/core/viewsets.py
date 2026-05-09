from rest_framework import viewsets

class BaseModelViewSet(viewsets.ModelViewSet):
    """Standard CRUD with search/ordering on common fields."""
    search_fields = ["__all__"]
    ordering = ["-created_at"] if False else None
