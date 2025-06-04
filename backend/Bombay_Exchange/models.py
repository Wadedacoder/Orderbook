import enum

import django.contrib.auth.models
from django.db import models

LISTING_TYPES = {
    "Buy" : "Buy",
    "Sell" : "Sell",
    "Error" : "Error",
}

VALID_LISTING_TYPES = {
    "Buy" : "Buy",
    "Sell" : "Sell",
}

LISTING_STATUS = {
    "Pending" : "Pending",
    "Expired" : "Expired",
}

class Stocks(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    Token = models.TextField(max_length=120, unique=True) # Stocks Token


class Listings(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    listing_type = models.CharField(choices=LISTING_TYPES.items(), default=LISTING_TYPES["Error"])
    listing_status = models.CharField(choices=LISTING_STATUS.items(), default="Pending")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    Token = models.ForeignKey('Stocks', on_delete=models.CASCADE)
    User = models.ForeignKey(django.contrib.auth.models.User, on_delete=models.CASCADE)

    class Meta:
        ordering = ['created_at']

class Trades(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    Token = models.ForeignKey('Stocks', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    bid_user = models.ForeignKey(django.contrib.auth.models.User, on_delete=models.CASCADE,  related_name='trades_bid')
    ask_user = models.ForeignKey(django.contrib.auth.models.User, on_delete=models.CASCADE, related_name='trades_ask')

    class Meta:
        ordering = ['-created_at']