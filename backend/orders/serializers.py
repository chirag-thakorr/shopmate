from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_id','product_title','price','quantity']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id','full_name','email','address','created_at','paid','total_amount','items']
        read_only_fields = ['id','created_at','paid','total_amount']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        # calculate total
        total = 0
        for it in items_data:
            total += float(it.get('price', 0)) * int(it.get('quantity', 0))
        validated_data['total_amount'] = total
        order = Order.objects.create(**validated_data)
        order_items = []
        for it in items_data:
            order_items.append(OrderItem(order=order,
                                         product_id=it.get('product_id'),
                                         product_title=it.get('product_title'),
                                         price=it.get('price'),
                                         quantity=it.get('quantity')))
        OrderItem.objects.bulk_create(order_items)
        return order
