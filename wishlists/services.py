from .models import Wishlist
from stores.models import Store
from stores.services import get_nearby_stores_within


def create_wishlist(buyer: str, items: list, store: Store):
    wishlist = Wishlist(buyer=buyer, items=items, store_id=store)

    wishlist.save()

    return wishlist


def get_wishlists(latitude: float, longitude: float, options: dict):
    return Wishlist.objects.filter(
        **options,
        store__in=get_nearby_stores_within(
            latitude=latitude, longitude=longitude, km=5, limit=100
        )
    ).order_by("-created_at")
