from django.urls import path
from .views import login, register, risk
from .map_location import location_map

urlpatterns = [
    path('login/', login),
    path('register/', register),
    path('risk/', risk),
    path('location/', location_map),
]