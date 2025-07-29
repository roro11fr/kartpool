from rest_framework import serializers
from stores.models import Store


class NearbyStoreSerializer(serializers.ModelSerializer):

    distance = serializers.SerializerMethodField()

    def get_distance(self, instance):
        return instance.distance.mi if instance else "N/A"

    class Meta:
        model = Store
        fields = [
            "id",
            "name",
            "rating",
            "opening_hour",
            "closing_hour",
            "store_type",
            "address",
            "latitude",
            "longitude",
            "distance",
        ]
