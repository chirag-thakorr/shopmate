



from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSeller(BasePermission):
    """
    Allow access only to users in 'seller' group (or staff).
    Use this to protect routes that only sellers may call.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # staff users allowed by default
        if getattr(user, "is_staff", False):
            return True
        # check groups - requires that you create a group named 'seller'
        return user.groups.filter(name="seller").exists()


class IsSellerOrReadOnly(BasePermission):
    """
    Read-only requests are allowed for anyone.
    Unsafe methods (POST/PUT/PATCH/DELETE) allowed only to sellers (or staff).
    """

    def has_permission(self, request, view):
        # allow safe methods for all
        if request.method in SAFE_METHODS:
            return True
        # otherwise require seller permission
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "is_staff", False):
            return True
        return user.groups.filter(name="seller").exists()
