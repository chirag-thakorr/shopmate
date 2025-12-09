# backend/orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_id', 'product_title', 'price', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id','full_name','email','address','created_at','paid','total_amount','items']
        read_only_fields = ['id','created_at','paid','total_amount']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])

        # Total + stock validation
        total = 0
        order_items = []

        for it in items_data:
            product_id = it.get('product_id')
            qty = int(it.get('quantity', 0))

            # 1) Product fetch + lock row for update (concurrent orders safe if view wraps in transaction)
            try:
                product = Product.objects.select_for_update().get(pk=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    {"detail": f"Product with id {product_id} does not exist."}
                )

            # 2) Check stock
            if product.inventory < qty:
                raise serializers.ValidationError(
                    {"detail": f"Not enough stock for {product.title}. Available: {product.inventory}, requested: {qty}"}
                )

            # 3) Reduce stock
            product.inventory -= qty
            product.save()

            # 4) Calculate total
            price = float(it.get('price', 0))
            total += price * qty

            # 5) Prepare OrderItem snapshot
            order_items.append(
                OrderItem(
                    order=None,  # order abhi create hoga
                    product_id=product.id,
                    product_title=product.title,  # backend se trusted title
                    price=price,
                    quantity=qty,
                )
            )

        validated_data['total_amount'] = total

        # 6) Create Order itself
        order = Order.objects.create(**validated_data)

        # 7) Attach order to each OrderItem and bulk create
        for oi in order_items:
            oi.order = order
        OrderItem.objects.bulk_create(order_items)

        return order
