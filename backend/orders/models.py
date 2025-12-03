from django.db import models
from django.utils import timezone
from django.conf import settings


class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    address = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    paid = models.BooleanField(default=False)  # will remain False for now
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Order #{self.id} - {self.full_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_id = models.IntegerField()   # store product id snapshot
    product_title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
