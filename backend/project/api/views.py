from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User
import random

@api_view(['GET'])
def risk(request):
    rainfall = random.randint(0, 200)
    aqi = random.randint(0, 300)

    risk_score = (rainfall * 0.6) + (aqi * 0.4)

    level = "SAFE"
    if risk_score > 70:
        level = "HIGH"
    elif risk_score > 30:
        level = "MEDIUM"

    return Response({
        "location": "Kochi",
        "aqi": aqi,
        "rainfall": rainfall,
        "risk_score": int(risk_score),
        "level": level
    })

@api_view(['POST'])
def register(request):
    data = request.data

    if User.objects.filter(email=data['email']).exists():
        return Response({"message": "User already exists"}, status=400)

    user = User.objects.create(
        fullName=data['fullName'],
        email=data['email'],
        password=data['password']
    )

    return Response({"user": {"email": user.email}})


@api_view(['POST'])
def login(request):
    data = request.data

    try:
        user = User.objects.get(
            email=data['email'],
            password=data['password']
        )
        return Response({"user": {"email": user.email}})
    except:
        return Response({"message": "Invalid credentials"}, status=401)