from django.urls import path, include
from rest_framework import routers
from .views import ProductViewSet, CategoryViewSet, SellerProductViewSet

router = routers.DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'seller/products', SellerProductViewSet, basename='seller-products')

urlpatterns = [
    path('', include(router.urls)),
]
