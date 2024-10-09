# stores/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreView
from home import views as home_views

router = DefaultRouter()
router.register(r'stores', StoreView, basename='stores')
router.register(r'home', home_views.HomePage, basename='home')

urlpatterns = [
    path('api/', include(router.urls)),  # API routes
    path('', home_views.HomePage.as_view({'get': 'list'}), name='home'),  # Pagina principală
    path('stores/', home_views.fetch_nearby_stores, name='fetch_nearby_stores'),  # Endpoint pentru magazine
]