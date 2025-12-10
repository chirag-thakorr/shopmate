from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from .models import UserProfile

User = get_user_model()
# seriol
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=[('customer','Customer'), ('seller','Seller')],
                                   default='customer')
    class Meta:
        model = User
        fields = ('id','username','email','password','role')

    def create(self, validated_data):
        role = validated_data.pop('role', 'customer')
        user = User.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=validated_data.get('password')
        )
        # profile update
        profile = getattr(user, 'profile', None)
        if profile is None:
            profile = UserProfile.objects.create(user=user)
        profile.role = role
        profile.save()

        # if seller, put in Seller group
        if role == 'seller':
            seller_group, _ = Group.objects.get_or_create(name='Seller')
            user.groups.add(seller_group)
            
        return user
