from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.utils import timezone
from .models import Category, Event, Order, Review
from .permissions import IsAdminUserOrReadOnly
from .serializers import (
    LoginSerializer, CategorySerializer, EventSerializer, 
    OrderSerializer, OrderCreateSerializer, ReviewSerializer,
    RegisterSerializer, ProfileSerializer, NotificationSerializer
)

# Authentication Views (FBV)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Categories Views

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

# Events Views

class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.active_events()
    serializer_class = EventSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user, available_seats=serializer.validated_data.get('total_seats'))

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAdminUserOrReadOnly]

@api_view(['GET'])
@permission_classes([AllowAny])
def search_events(request):
    query = request.query_params.get('q', '')
    category_slug = request.query_params.get('category', '')
    
    events = Event.objects.active_events()
    
    if query:
        events = events.filter(Q(title__icontains=query) | Q(description__icontains=query))
    if category_slug:
        events = events.filter(category__slug=category_slug)
        
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

# Orders Views

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.validated_data['event']
            quantity = serializer.validated_data['quantity']
            total_price = event.price * quantity
            
            # Reduce available seats
            event.available_seats -= quantity
            event.save()
            
            order = Order.objects.create(
                user=request.user,
                event=event,
                quantity=quantity,
                total_price=total_price
            )
            
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        # Restore seats before removing the order record.
        event = instance.event
        event.available_seats += instance.quantity
        event.save(update_fields=["available_seats"])
        instance.delete()


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class NotificationListView(generics.GenericAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        notifications = []
        now = timezone.now()

        recent_orders = (
            Order.objects.filter(user=request.user)
            .select_related('event')
            .order_by('-created_at')[:5]
        )
        for order in recent_orders:
            notifications.append({
                'id': f'order-{order.id}',
                'title': f'Order #{order.id} {order.status}',
                'message': (
                    f'Your order for "{order.event.title}" is currently {order.status}. '
                    f'Total paid: {order.total_price} KZT.'
                ),
                'kind': 'order',
                'created_at': order.created_at,
                'is_read': request.query_params.get('mark_read') == 'all',
                'action_label': 'View order',
                'action_route': '/orders',
            })

        if request.user.role == 'admin':
            organizer_events = (
                Event.objects.filter(organizer=request.user, date__gte=now)
                .order_by('date')[:5]
            )
            for event in organizer_events:
                notifications.append({
                    'id': f'event-{event.id}',
                    'title': f'Upcoming event: {event.title}',
                    'message': (
                        f'{event.available_seats} of {event.total_seats} seats remain for '
                        f'your event in {event.location}.'
                    ),
                    'kind': 'event',
                    'created_at': event.created_at,
                    'is_read': request.query_params.get('mark_read') == 'all',
                    'action_label': 'Manage event',
                    'action_route': f'/manage-events/edit/{event.id}',
                })

        notifications.sort(key=lambda item: item['created_at'], reverse=True)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
