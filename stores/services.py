from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.contrib.gis.geos import GEOSGeometry

from .models import Store

def get_nearby_stores_within(latitude: float, longitude: float, km: int=5, limit: int=None, srid: int=4326):
    coordinates = Point(longitude, latitude, srid=srid)
    print("Coordinates received:", coordinates)  # Log coordonatele
    point = GEOSGeometry(coordinates, srid=4326)
    nearby_stores = Store.objects.annotate(
        distance=Distance("location", coordinates)
    ).filter(
        location__distance_lte=(point, D(km=km))
    ).order_by('distance')[:limit]

    print("Nearby Stores:", nearby_stores)  # Verifică magazinele returnate
    return nearby_stores

