from rest_framework import serializers
from .models import Wishlist


class WishlistSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source="buyer.username", read_only=True)

    class Meta:
        model = Wishlist
        fields = [
            "id",
            "created_at",
            "buyer",
            "buyer_name",
            "wishmaster",
            "items",
            "status",
            "store",
        ]
