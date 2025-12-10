from rest_framework import viewsets, filters
from .models import Product, Category, Review
from .serializers import ProductSerializer, CategorySerializer, ReviewSerializer
from django.db.models import Avg, Count, Q
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.response import Response
# from .permissions import IsSellerOrReadOnly
from core.permissions import IsSeller
from core.permissions import IsSellerOrReadOnly



class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/categories/ -> list of categories
    """
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all().annotate(
        average_rating=Avg('reviews__rating'),
        review_count=Count('reviews')
    ).order_by('-created_at')
    serializer_class = ProductSerializer
    lookup_field = 'slug'   # detail by slug

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']

    permission_classes = [IsSellerOrReadOnly]

    def perform_create(self, serializer):
        # jab seller naya product banayega, seller field attach
        serializer.save(seller=self.request.user)

    def perform_update(self, serializer):
        # ensure sirf apne hi product update kare
        obj = self.get_object()
        if obj.seller and obj.seller != self.request.user:
            raise PermissionError("You are not allowed to edit this product.")
        serializer.save()
    
    @action(detail=False, methods=['get'], url_path='my', permission_classes=[IsAuthenticated])
    def my_products(self, request):
        qs = Product.objects.filter(seller=request.user).order_by('-created_at')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    # def get_queryset(self):
    #     qs = super().get_queryset()
    #     category_slug = self.request.query_params.get('category')
    #     if category_slug:
    #         qs = qs.filter(category__slug=category_slug)
    #     return qs
    def get_queryset(self):
        qs = Product.objects.all()
        # annotate with rating summary
        qs = qs.annotate(
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        ).order_by('-created_at')
        return qs

    @action(detail=True, methods=['get', 'post'], url_path='reviews', permission_classes=[IsAuthenticatedOrReadOnly])
    def reviews(self, request, slug=None):
        product = self.get_object()

        if request.method.lower() == 'get':
            qs = product.reviews.select_related('user')
            serializer = ReviewSerializer(qs, many=True)
            return Response(serializer.data)

        # POST - create review (logged-in only)
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        rating = serializer.validated_data['rating']
        if rating < 1 or rating > 5:
            return Response({'detail': 'Rating must be between 1 and 5'}, status=400)

        review, created = Review.objects.update_or_create(
            product=product,
            user=request.user,
            defaults={
                'rating': rating,
                'comment': serializer.validated_data.get('comment', '')
            }
        )
        out = ReviewSerializer(review)
        return Response(out.data, status=201 if created else 200)



class SellerProductViewSet(viewsets.ModelViewSet):
    """
    /api/seller/products/ ke liye ViewSet
    - sirf seller users ke liye allowed
    - queryset = sirf current user ke products
    - create/update/delete allowed
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    def get_queryset(self):
        # sirf apne hi products
        return Product.objects.filter(seller=self.request.user).order_by('-created_at')
        
    def perform_create(self, serializer):
        # seller field force karo logged-in user se
        serializer.save(seller=self.request.user)

    # def perform_update(self, serializer):
    #     serializer.save(seller=self.request.user)