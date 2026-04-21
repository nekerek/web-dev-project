from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    login_view, logout_view, register_view, CategoryListView, EventListCreateView, 
    EventDetailView, search_events, OrderListCreateView, OrderDetailView,
    ProfileView, NotificationListView
)

app_name = "tickets"

urlpatterns = [
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    
    path('categories/', CategoryListView.as_view(), name='category_list'),
    
    path('events/', EventListCreateView.as_view(), name='event_list_create'),
    path('events/search/', search_events, name='event_search'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event_detail'),
    
    path('orders/', OrderListCreateView.as_view(), name='order_list_create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
]
