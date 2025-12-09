from rest_framework import viewsets, filters
from .models import Product, Category, Review
from .serializers import ProductSerializer, CategorySerializer, ReviewSerializer
from django.db.models import Avg, Count
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response


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

    def get_queryset(self):
        qs = super().get_queryset()
        category_slug = self.request.query_params.get('category')
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
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

