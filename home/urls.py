from django.urls import path, include
from .views import HomePage, fetch_nearby_stores, authView

urlpatterns = [
    path('', HomePage.as_view({'get': 'list'}), name='home'),
    path('stores/', fetch_nearby_stores, name='fetch_nearby_stores'),
    path("accounts/", include("django.contrib.auth.urls")),
    path("signup/", authView, name="authView")
]