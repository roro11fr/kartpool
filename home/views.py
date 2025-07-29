from django.shortcuts import render, redirect
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.renderers import TemplateHTMLRenderer
from stores.models import Store
from rest_framework.decorators import api_view
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.contrib.gis.geos import Point
from django.http import JsonResponse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import login
from django.contrib import messages


class HomePage(LoginRequiredMixin, viewsets.GenericViewSet):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = "home/index.html"  # Asigură-te că acest fișier există

    def list(self, request):
        username = self.request.query_params.get("username")
        return Response({"username": username})


api_view(["GET"])


def fetch_nearby_stores(request):
    lat = request.GET.get("lat")
    lng = request.GET.get("lng")

    if not lat or not lng:  # Verifică dacă lat/lng sunt furnizate
        return JsonResponse(
            {"error": "Latitudinea și longitudinea sunt necesare."}, status=400
        )

    point = Point(float(lng), float(lat), srid=4326)  # SRID corect pentru coordonate

    # Obține magazinele și calculează distanța
    stores = (
        Store.objects.annotate(distance=Distance("location", point))
        .filter(distance__lte=D(km=5))
        .values("id", "name", "address", "phone", "distance", "longitude", "latitude")
    )

    # Convertim distanța în metri sau kilometri
    stores_data = [
        {
            "id": store["id"],
            "name": store["name"],
            "address": store["address"],
            "phone": store["phone"],
            "distance": store["distance"].km,  # sau .km pentru kilometri
            "longitude": store["longitude"],
            "latitude": store["latitude"],
        }
        for store in stores
    ]

    return JsonResponse(stores_data, safe=False)


def authView(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("home")
        else:
            messages.error(
                request,
                "Requirements not met. Please check the information you've entered.",
            )
    else:
        form = UserCreationForm()

    return render(request, "registration/signup.html", {"form": form})
