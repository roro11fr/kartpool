from django.urls import path
from .views import estimate_time_view

urlpatterns = [
    path("estimate-time/", estimate_time_view, name="estimate-time"),
]
