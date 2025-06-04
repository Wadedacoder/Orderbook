from rest_framework import serializers
from django.contrib.auth.models import User
import Bombay_Exchange.models as models

class ListingsSerializer(serializers.ModelSerializer):
    Token = serializers.SlugRelatedField(
        queryset=models.Stocks.objects.all(),  # Needed for deserialization
        slug_field='Token'  # Or whatever field identifies the stock (e.g., 'symbol')
    )
    User = serializers.SlugRelatedField(
        queryset=User.objects.all(), slug_field='username', required=False
    )
    price = serializers.FloatField(required=True, min_value=0)
    quantity = serializers.IntegerField(required=True, min_value=1)
    listing_type = serializers.ChoiceField(models.VALID_LISTING_TYPES)
                                                    
    class Meta:
        model = models.Listings
        fields = ['id','Token', 'price', 'quantity', 'created_at', 'listing_type', 'listing_status','User']


class RegisterSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ['id','username', 'email', 'password']




    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user

class TradesSerializer(serializers.ModelSerializer):
    Token = serializers.SlugRelatedField(
        queryset=models.Stocks.objects.all(),
        slug_field='Token'
    )
    bid_user = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field='username'
    )
    ask_user = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field='username'
    )
    price = serializers.FloatField(required=True, min_value=0)
    quantity = serializers.IntegerField(required=True, min_value=1)

    class Meta:
        model = models.Trades
        fields = ['id','created_at','Token','price','quantity','bid_user','ask_user']

class StocksSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Stocks
        fields = ['Token']