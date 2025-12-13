from django.urls import path, include
from rest_framework import routers
from .views import ProductViewSet, CategoryViewSet, WishlistViewSet

router = routers.DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register('wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('', include(router.urls)),
]
