from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import Cart, CartItem
from products.models import Product

def get_or_create_cart(user):
    cart, created = Cart.objects.get_or_create(user=user)
    return cart

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart = get_or_create_cart(request.user)
    from .serializers import CartSerializer
    return Response(CartSerializer(cart).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get("product_id")
    quantity = int(request.data.get("quantity", 1))

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found"}, status=404)

    cart = get_or_create_cart(request.user)

    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    item.quantity += quantity
    item.save()

    return Response({"detail": "Added to cart"})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_item(request, item_id):
    quantity = int(request.data.get("quantity", 1))
    
    try:
        item = CartItem.objects.get(id=item_id, cart__user=request.user)
    except CartItem.DoesNotExist:
        return Response({"detail": "Item not found"}, status=404)

    if quantity <= 0:
        item.delete()
    else:
        item.quantity = quantity
        item.save()

    return Response({"detail": "Updated"})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_item(request, item_id):
    try:
        item = CartItem.objects.get(id=item_id, cart__user=request.user)
    except CartItem.DoesNotExist:
        return Response({"detail": "Item not found"}, status=404)

    item.delete()
    return Response({"detail": "Removed"})
