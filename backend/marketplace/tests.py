from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category
from tickets.models import User


class MarketplaceRouteTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="seller", password="secret123")
        Category.objects.create(name="Books", description="Textbooks and notes")

    def test_marketplace_category_endpoint_is_reachable(self):
        response = self.client.get("/api/marketplace/categories/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(category["name"] == "Books" for category in response.data))

    def test_marketplace_login_returns_token(self):
        response = self.client.post(
            "/api/marketplace/auth/login/",
            {"username": "seller", "password": "secret123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
