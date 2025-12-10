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
from rest_framework.permissions import BasePermission

class IsSeller(BasePermission):
    """
    Sirf unhi users ko allow karega jo authenticated hain
    aur jinke paas is_seller = True hai.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_seller", False)  # safe check
        )

