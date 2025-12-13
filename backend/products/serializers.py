from rest_framework import serializers
from .models import Product, Category, Review, Wishlist

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name','slug']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    # average_rating = serializers.FloatField(read_only=True)
    average_rating = serializers.FloatField(source='avg_rating', read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Product
        fields = ['id','title','slug','description','price','category','image','inventory','average_rating', 'review_count','created_at']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user_name', 'created_at']

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'created_at']
