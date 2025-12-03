from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from .serializers import RegisterSerializer

def health(request):
    return JsonResponse({"status":"ok","message":"Django backend running"})

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return JsonResponse({'id': user.id, 'username': user.username, 'email': user.email}, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
