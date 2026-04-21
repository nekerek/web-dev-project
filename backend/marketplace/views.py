from rest_framework import permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Listing
from .serializers import CategorySerializer, ListingCreateSerializer, ListingSerializer, LoginSerializer


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def category_list(request):
    serializer = CategorySerializer(Category.objects.all(), many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def featured_listings(request):
    serializer = ListingSerializer(Listing.active.select_related("owner", "category")[:6], many=True)
    return Response(serializer.data)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token, _ = Token.objects.get_or_create(user=serializer.validated_data["user"])
        return Response({"token": token.key, "username": serializer.validated_data["user"].username})


class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        if request.auth is not None:
            request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ListingListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        listings = Listing.objects.select_related("owner", "category")
        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ListingCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        listing = serializer.save()
        return Response(ListingSerializer(listing).data, status=status.HTTP_201_CREATED)


class ListingDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Listing.objects.select_related("owner", "category").get(pk=pk)
        except Listing.DoesNotExist:
            return None

    def get(self, request, pk):
        listing = self.get_object(pk)
        if listing is None:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ListingSerializer(listing).data)

    def put(self, request, pk):
        listing = self.get_object(pk)
        if listing is None:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)
        if listing.owner != request.user:
            return Response({"detail": "You can update only your own listings."}, status=status.HTTP_403_FORBIDDEN)
        serializer = ListingSerializer(listing, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        listing = self.get_object(pk)
        if listing is None:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)
        if listing.owner != request.user:
            return Response({"detail": "You can delete only your own listings."}, status=status.HTTP_403_FORBIDDEN)
        listing.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
