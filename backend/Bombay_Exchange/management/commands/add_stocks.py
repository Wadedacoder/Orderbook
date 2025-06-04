from django.core.management.base import BaseCommand
from Bombay_Exchange.models import Stocks
from django.contrib.auth.models import User
from datetime import datetime

class Command(BaseCommand):
    help = 'Add stocks to database'

    def handle(self, *args, **options):
        # Adding RELIANCE
        Reliance = Stocks(
            Token='RELIANCE'
        )
        Reliance.save()

        Apple = Stocks(
            Token='APPL'
        )
        Apple.save()

        Google = Stocks(
            Token='GGL'
        )
        Google.save()
