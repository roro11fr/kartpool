from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WishlistView

router = DefaultRouter()
router.register(r"wishlists", WishlistView, basename="wishlist")

urlpatterns = [
    path("", include(router.urls)),
]
