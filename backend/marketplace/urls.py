from django.urls import path

from . import views

app_name = "marketplace"

urlpatterns = [
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("categories/", views.category_list, name="categories"),
    path("listings/featured/", views.featured_listings, name="featured-listings"),
    path("listings/", views.ListingListCreateView.as_view(), name="listing-list"),
    path("listings/<int:pk>/", views.ListingDetailView.as_view(), name="listing-detail"),
]
