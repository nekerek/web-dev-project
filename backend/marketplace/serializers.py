from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Category, Listing, Message, Offer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description"]


class ListingSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "owner",
            "category",
            "category_name",
            "title",
            "description",
            "price",
            "campus_location",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["owner", "created_at", "updated_at"]


class OfferSerializer(serializers.ModelSerializer):
    buyer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Offer
        fields = ["id", "listing", "buyer", "amount", "note", "created_at"]
        read_only_fields = ["buyer", "created_at"]


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "listing", "sender", "body", "created_at"]
        read_only_fields = ["sender", "created_at"]


class ListingCreateSerializer(serializers.Serializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    title = serializers.CharField(max_length=120)
    description = serializers.CharField()
    price = serializers.DecimalField(max_digits=8, decimal_places=2)
    campus_location = serializers.CharField(max_length=120)

    def create(self, validated_data):
        return Listing.objects.create(owner=self.context["request"].user, **validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs["username"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        attrs["user"] = user
        return attrs
