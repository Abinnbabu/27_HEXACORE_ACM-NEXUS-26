from django.urls import path
from .views import login, register, risk

urlpatterns = [
    path('login/', login),
    path('register/', register),
    path('risk/', risk),
]