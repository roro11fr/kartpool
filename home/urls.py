from django.urls import path
from .views import HomePage, fetch_nearby_stores

urlpatterns = [
    path('', HomePage.as_view({'get': 'list'}), name='home'),  # Pagina principală
    path('stores/', fetch_nearby_stores, name='fetch_nearby_stores'),
]