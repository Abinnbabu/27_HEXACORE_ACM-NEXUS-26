from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User

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