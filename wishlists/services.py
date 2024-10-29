from django.core.exceptions import ObjectDoesNotExist  
from .models import Wishlist  
from stores.models import Store

def create_wishlist(buyer: str, items: list, store: Store):  
    wishlist = Wishlist(  
        buyer=buyer,  
        items=items,  
        store_id=store  
    )
    
    wishlist.save()
    
    return wishlist
