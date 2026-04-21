from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Category, Event, Order, Review

class UserSerializer(serializers.ModelSerializer):
    preferred_category = serializers.CharField(source='preferred_category.name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone', 'avatar', 'role',
            'email_notifications', 'event_reminders', 'marketing_updates', 'preferred_category'
        ]

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'), username=username, password=password)
            if not user:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include "username" and "password".')
        
        data['user'] = user
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True)
    
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['available_seats', 'organizer']

class OrderCreateSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, data):
        event_id = data.get('event_id')
        quantity = data.get('quantity')
        
        try:
            event = Event.objects.get(id=event_id, is_active=True)
        except Event.DoesNotExist:
            raise serializers.ValidationError("Event does not exist or is inactive.")
            
        if event.available_seats < quantity:
            raise serializers.ValidationError(f"Not enough seats available. Only {event.available_seats} left.")
            
        data['event'] = event
        return data

class OrderSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['user', 'total_price', 'status']

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'user')
        )
        return user


class ProfileSerializer(serializers.ModelSerializer):
    preferred_category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='preferred_category',
        allow_null=True,
        required=False,
    )
    preferred_category_name = serializers.CharField(source='preferred_category.name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone',
            'role',
            'email_notifications',
            'event_reminders',
            'marketing_updates',
            'preferred_category_id',
            'preferred_category_name',
        ]
        read_only_fields = ['id', 'username', 'role']


class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    message = serializers.CharField()
    kind = serializers.CharField()
    created_at = serializers.DateTimeField()
    is_read = serializers.BooleanField()
    action_label = serializers.CharField(required=False, allow_blank=True)
    action_route = serializers.CharField(required=False, allow_blank=True)
