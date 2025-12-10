# backend/orders/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from .serializers import OrderSerializer
from .models import Order


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    http_method_names = ['get','post','head','options']

    def get_permissions(self):
        # list/create remain open (we may want create open for guest checkout)
        # but custom actions can require auth
        if self.action in ['my_orders', 'create']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            order = serializer.save()
            # if authenticated, attach user
            if request.user and request.user.is_authenticated:
                order.user = request.user
                order.save()
        return Response(self.get_serializer(order).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='my', url_name='my_orders')
    def my_orders(self, request):
        """
        Returns orders for the authenticated user.
        GET /api/orders/my/
        """
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        qs = Order.objects.filter(user=user).order_by('-created_at')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
