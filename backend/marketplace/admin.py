from django.contrib import admin

from .models import Category, Listing, Message, Offer

admin.site.register(Category)
admin.site.register(Listing)
admin.site.register(Offer)
admin.site.register(Message)
