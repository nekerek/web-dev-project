from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin/Organizer')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    email_notifications = models.BooleanField(default=True)
    event_reminders = models.BooleanField(default=True)
    marketing_updates = models.BooleanField(default=False)
    preferred_category = models.ForeignKey(
        'Category',
        related_name='subscribers',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.username

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'Categories'

class EventManager(models.Manager):
    def active_events(self):
        return self.filter(is_active=True)
        
    def upcoming_events(self):
        return self.filter(is_active=True, date__gte=timezone.now())
        
    def by_category(self, slug):
        return self.filter(is_active=True, category__slug=slug)

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_seats = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    category = models.ForeignKey(Category, related_name='events', on_delete=models.CASCADE)
    organizer = models.ForeignKey(User, related_name='organized_events', on_delete=models.CASCADE)
    organization = models.CharField(max_length=255, blank=True, null=True, verbose_name="Organization Name")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    objects = EventManager()

    def __str__(self):
        return self.title

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled')
    ]
    
    user = models.ForeignKey(User, related_name='orders', on_delete=models.CASCADE)
    event = models.ForeignKey(Event, related_name='orders', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

class Review(models.Model):
    user = models.ForeignKey(User, related_name='reviews', on_delete=models.CASCADE)
    event = models.ForeignKey(Event, related_name='reviews', on_delete=models.CASCADE)
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username} for {self.event.title}"
