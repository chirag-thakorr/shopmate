from django.conf import settings
from django.conf.urls.static import static

from django.contrib import admin
from django.urls import path, include
from core.views import health, register, me
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', health),

    # auth / user endpoints
    path('api/register/', register),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', me),

    # orders / products
    path('api/', include('products.urls')),
    path('api/', include('orders.urls')),
    
    # cart
    path("api/cart/", include("cart.urls")),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
