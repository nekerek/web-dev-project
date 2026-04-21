from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Category, Event, Order, Review

admin.site.register(User, UserAdmin)
admin.site.register(Category)
admin.site.register(Event)
admin.site.register(Order)
admin.site.register(Review)
