from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils import timezone


class Store(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    created_at = models.DateTimeField(default=timezone.now)
    name = models.CharField(max_length=100)
    rating = models.FloatField(
        null=True, validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    store_type = models.CharField(null=True, max_length=50)
    opening_hour = models.TimeField(null=True)
    closing_hour = models.TimeField(null=True)
    city = models.CharField(max_length=50)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    location = models.PointField(null=True)
    address = models.CharField(max_length=100)
    phone = models.CharField(null=True, max_length=100)
