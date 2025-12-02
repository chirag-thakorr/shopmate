from rest_framework import viewsets, status
from rest_framework.response import Response
from .serializers import OrderSerializer
from .models import Order
from django.db import transaction

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    http_method_names = ['get','post','head','options']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            order = serializer.save()
        return Response(self.get_serializer(order).data, status=status.HTTP_201_CREATED)
