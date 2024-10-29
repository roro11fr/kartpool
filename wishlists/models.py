from django.db import models  
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import User

# Create your models here.

WISHLIST_STATUSES = [  
    ("PENDING", "PENDING"),  
    ("ACCEPTED", "ACCEPTED"),  
    ("FULFILLED", "FULFILLED")  
]

class Wishlist(models.Model):  
    created_at = models.DateTimeField(auto_now_add=True)  
    buyer = models.ForeignKey(User, on_delete=models.CASCADE)  
    wishmaster = models.CharField(max_length=100)  
    items = ArrayField(models.CharField(max_length=100))  
    status = models.CharField(  
        choices=WISHLIST_STATUSES,  
        default="PENDING",  
        max_length=10  
    )  
    store = models.ForeignKey(  
        "stores.Store",  
        related_name="wishlists",  
        on_delete=models.SET_NULL,  
        null=True  
    )  

    def __str__(self):
        return f"{self.buyer.username}'s Wishlist"