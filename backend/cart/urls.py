from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_cart),
    path('add/', views.add_to_cart),
    path('item/<int:item_id>/update/', views.update_item),
    path('item/<int:item_id>/remove/', views.remove_item),
]
