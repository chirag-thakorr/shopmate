from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from .serializers import RegisterSerializer
from rest_framework.permissions import IsAuthenticated


def health(request):
    return JsonResponse({"status":"ok","message":"Django backend running"})

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return JsonResponse({'id': user.id, 'username': user.username, 'email': user.email}, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return JsonResponse({
        "id": user.id,
        "username": user.username,
        "email": user.email,
    })