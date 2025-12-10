# # backend/core/permissions.py
# from rest_framework.permissions import BasePermission

# class IsSeller(BasePermission):
#     """
#     Allow access only to authenticated users who are in 'seller' group.
#     """

#     def has_permission(self, request, view):
#         user = request.user
#         if not user or not user.is_authenticated:
#             return False
#         return user.groups.filter(name='seller').exists()


# backend/core/permissions.py
# from rest_framework.permissions import BasePermission

# class IsSeller(BasePermission):
#     """
#     Sirf unhi users ko allow karega jo authenticated hain
#     aur jinke paas is_seller = True hai.
#     """

#     def has_permission(self, request, view):
#         return bool(
#             request.user
#             and request.user.is_authenticated
#             and getattr(request.user, "is_seller", False)  # safe check
#         )



from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsSellerOrReadOnly(BasePermission):
    """
    Read sab ke liye open.
    Write (POST/PUT/PATCH/DELETE) sirf seller ke liye.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # option 1: role from profile
        profile = getattr(user, 'profile', None)
        if profile and profile.role == 'seller':
            return True

        # option 2: Seller group
        if user.groups.filter(name='Seller').exists():
            return True

        return False
