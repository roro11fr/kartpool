from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets  
from rest_framework.response import Response
from .models import Wishlist  
from .serializers import WishlistSerializer
from .services import create_wishlist

# Create your views here.
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Wishlist
from .serializers import WishlistSerializer
from .services import create_wishlist

class WishlistView(viewsets.ModelViewSet):  
    queryset = Wishlist.objects.all()  
    serializer_class = WishlistSerializer  
    permission_classes = [IsAuthenticated]

    def create(self, request):  

        print("Request data:", request.data)
        print("User:", request.user)

        buyer = request.user  
        items = request.data.get('items')  
        store = int(request.data.get('store'))
        
        # Verifică dacă buyer-ul, items și store sunt valide
        if not items or not store:
            return Response({"error": "Items and store must be provided."}, status=400)

        wishlist = create_wishlist(buyer, items, store)  
        wishlist_data = WishlistSerializer(wishlist)
        
        return Response(wishlist_data.data, status=201)  # Returnează un status 201 pentru creație reușită

    def list(self, request, *args, **kwargs):
        user_wishlists = Wishlist.objects.filter(buyer=request.user)
        serializer = self.get_serializer(user_wishlists, many=True)

        return Response(serializer.data)




