from django.contrib import admin
from .models import Product, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title','price','inventory','created_at')
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('category',)
    search_fields = ('title','description')
