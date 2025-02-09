from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets  
from rest_framework.response import Response
from .models import Wishlist, User  
from .serializers import WishlistSerializer
from .services import create_wishlist, get_wishlists

# Create your views here.
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
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

    def list(self, request):
        latitude = self.request.query_params.get('lat')
        longitude = self.request.query_params.get('lng')
        options = {}
       
        buyer_id = self.request.query_params.get('buyer')
        if buyer_id:
            try:
                # Verifică dacă buyer_id este valid și există un utilizator cu acest ID
                buyer = User.objects.get(id=buyer_id)
                options['buyer'] = buyer  # Filtrează wishlist-urile pentru utilizatorul cu acest ID
            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=400)
            except ValueError:
                return Response({"error": "Buyer ID must be a number."}, status=400)

        # Filtrare pe baza altor opțiuni (de exemplu, wishmaster)
        for key in ('wishmaster',):
            value = self.request.query_params.get(key)
            if value:
                options[key] = value

        # Obține wishlist-urile folosind funcția de filtrare personalizată
        wishlists = get_wishlists(
            float(latitude),
            float(longitude),
            options
        )
        
        wishlist_data = WishlistSerializer(wishlists, many=True)
        return Response({"wishlists": wishlist_data.data})
    
    @action(detail=False, methods=['get'])
    def my_wishlists(self, request):
        latitude = self.request.query_params.get('lat')
        longitude = self.request.query_params.get('lng')
        options = {}
       
        options['buyer'] = request.user  # Filtrăm pentru wishlist-urile utilizatorului curent

        # Filtrare pe baza altor opțiuni (de exemplu, wishmaster)
        for key in ('wishmaster',):
            value = self.request.query_params.get(key)
            if value:
                options[key] = value

        # Obține wishlist-urile folosind funcția de filtrare personalizată
        wishlists = get_wishlists(
            float(latitude),
            float(longitude),
            options
        )
        
        wishlist_data = WishlistSerializer(wishlists, many=True)
        return Response({"wishlists": wishlist_data.data})



