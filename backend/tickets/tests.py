from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import Category, Event, Order, User


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alice", password="secret123")
        self.client = APIClient()

    def test_logout_blacklists_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        response = self.client.post(
            reverse("tickets:logout"),
            {"refresh": str(refresh)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
        self.assertTrue(BlacklistedToken.objects.filter(token__jti=refresh["jti"]).exists())


class OrderCancellationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="buyer", password="secret123")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

        self.category = Category.objects.create(name="Music", slug="music")
        self.event = Event.objects.create(
            title="Campus Concert",
            description="Live show",
            date=timezone.now() + timedelta(days=5),
            location="Hall A",
            price="25.00",
            total_seats=100,
            available_seats=95,
            category=self.category,
            organizer=self.user,
        )
        self.order = Order.objects.create(
            user=self.user,
            event=self.event,
            quantity=2,
            total_price="50.00",
        )

    def test_delete_order_restores_seats_and_removes_order(self):
        response = self.client.delete(reverse("tickets:order_detail", args=[self.order.pk]))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.event.refresh_from_db()
        self.assertEqual(self.event.available_seats, 97)
        self.assertFalse(Order.objects.filter(pk=self.order.pk).exists())
