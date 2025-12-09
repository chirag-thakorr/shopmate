from django.contrib import admin
from .models import Product, Category, Review   

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ('user', 'rating', 'comment', 'created_at')    

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title','price','inventory','created_at')
    inlines = [ReviewInline]
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('category',)
    search_fields = ('title','description')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__title', 'user__username', 'comment')