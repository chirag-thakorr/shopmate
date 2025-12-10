from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsSellerOrReadOnly(BasePermission):
    """
    Read sab ke liye allowed.
    Write operations sirf tab allowed jab user authenticated + Seller group me ho.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.groups.filter(name='Seller').exists()
