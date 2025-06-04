from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_redis import get_redis_connection

import json
import time

import Bombay_Exchange.models as bombay_models
import Bombay_Exchange.serializer as bombay_serializer


MULTIPLIER = 10**9

def encode_score(price: float, timestamp, listing_type: str) -> int:
    '''
    Scoring system for both the buy and sell priority queues.

    :param price:
    :param timestamp:
    :param listing_type:
    :return: scoring system
    '''
    price_part = int(price * MULTIPLIER) # price is at max 2 decimal base
    time_part = int(timestamp)

    if listing_type == 'Sell':
        return -price_part - time_part
    else:
        return price_part - time_part


def get_redis_key(token_name: str, listing_type: str) -> str:
    return token_name + "-" + listing_type

def match_listings(listing):
    expired_listings = []
    remaining_listing = listing
    print(remaining_listing)
    redis_db = get_redis_connection("default")
    listing_type = listing.get("listing_type")
    opp_listing_type = 'Sell'
    if listing_type == 'Sell':
        opp_listing_type = 'Buy'

    redis_key = get_redis_key(listing.get("token_name"), opp_listing_type)
    quantity = listing.get("quantity")
    price = listing.get("price")
    print(redis_db.zrange(redis_key, 0, -1, withscores=True))
    while quantity > 0:
        potential_option = redis_db.zpopmax(redis_key, 1)
        print('pot: ', potential_option)
        if potential_option is None or len(potential_option) == 0: # no listing of opposite type
            break
        member_str, score = potential_option[0]
        potential_option = json.loads(member_str)
        print(potential_option)
        if potential_option.get('quantity') == 0:
            continue
        condition = ((listing_type == 'Sell') and (potential_option["price"] >= price)) or ((listing_type == 'Buy') and (potential_option["price"] <= price))
        if condition:
            amount = min(potential_option["quantity"], quantity)
            quantity -= amount
            potential_option["quantity"] -= amount
            if potential_option["quantity"] <= 0:
                expired_listings.append(potential_option['id'])
            else:
                member_str = json.dumps(potential_option)
                print('making trade')
                trade = bombay_models.Trades.objects.create(
                    quantity=amount,
                    price=min(potential_option["price"], price),
                    bid_user_id=potential_option['user_id'] if listing['listing_type'] == 'Sell' else remaining_listing['user_id'],
                    ask_user_id=remaining_listing['user_id'] if listing['listing_type'] == 'Sell' else potential_option['user_id'],
                    Token = remaining_listing['Stock'],
                )
                expire_listings = bombay_models.Listings.objects.filter(id=potential_option['id']).update(quantity=potential_option['quantity'])
                redis_db.zadd(redis_key, {member_str: score})
        else:
            break # no more valid pricing
        # return expired_listings, remaining_listing
    print(expired_listings)
    remaining_listing = listing
    remaining_listing["quantity"] = quantity
    return expired_listings, remaining_listing


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def listings(request):
    '''
    API to handle listings.
    :param request:
    :return:
    '''
    try:
        user_id = request.user.id
        if request.method == 'GET':
            listings_all = bombay_models.Listings.objects.select_related('Token').filter(listing_status='Pending')
            listings_serializer = bombay_serializer.ListingsSerializer(listings_all, many=True)
            return Response(listings_serializer.data)

        elif request.method == 'POST':
            time_stamp = time.time()
            listings_serializer = bombay_serializer.ListingsSerializer(data=request.data)
            if listings_serializer.is_valid():
                # check if Token name is a stock
                stock = bombay_models.Stocks.objects.filter(Token=listings_serializer.data['Token']).first()
                if stock is None:
                    return Response(listings_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                # Create the listing
                listing_match = {
                    'token_name': stock.Token,
                    'listing_type': listings_serializer.data['listing_type'],
                    'price': listings_serializer.data['price'],
                    'quantity': listings_serializer.data['quantity'],
                    'user_id': user_id,
                    'Stock': stock,
                }
                expired_listings_ids, remaining_listing = match_listings(listing_match)
                listing_status = 'Pending'
                if remaining_listing['quantity'] == 0:
                    listing_status = 'Expired'

                # expire all the expired listings
                expire_listings = bombay_models.Listings.objects.filter(id__in=expired_listings_ids)
                expire_listings.update(listing_status='Expired')
                all_trades = [
                    bombay_models.Trades(
                        Token=expire_listing.Token,
                        price=expire_listing.price,
                        quantity=expire_listing.quantity,
                        bid_user_id=expire_listing.User_id if request.data['listing_type'] == 'Sell' else user_id,
                        ask_user_id=user_id if request.data['listing_type'] == 'Sell' else expire_listing.User_id
                    )
                    for expire_listing in expire_listings
                ]
                bombay_models.Trades.objects.bulk_create(all_trades)

                listing_entry = bombay_models.Listings.objects.create(
                    Token=stock,
                    price = remaining_listing['price'],
                    quantity = remaining_listing['quantity'],
                    listing_type = remaining_listing['listing_type'],
                    listing_status = listing_status,
                    User_id = user_id,
                )
                remaining_listing['id'] = listing_entry.id
                if remaining_listing['quantity'] > 0:
                    # add item to redis
                    redis_db = get_redis_connection('default')
                    listing_stored = {
                          'price': listings_serializer.data['price'],
                          'quantity': remaining_listing['quantity'],
                          'id': remaining_listing['id'],
                          'user_id': user_id,
                    }
                    listing_stored = json.dumps(listing_stored)
                    redis_db.zadd(get_redis_key(listings_serializer.data['Token'], listings_serializer.data['listing_type']),
                                  {listing_stored : encode_score(listings_serializer.data['price'], time_stamp, listings_serializer.data['listing_type'])})
                return Response({'status':'success'}, status=status.HTTP_201_CREATED)
            return Response(listings_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    except Exception as e:
        print(e)
        return Response({'status': 'error', 'message' : str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    '''
    API to register new users
    :param request:
    :return:
    '''
    try:
        serializer = bombay_serializer.RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'status': 'error', 'message' : str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trades(request):
    '''
    Api to view old trades
    :param request:
    :return:
    '''
    all_trades = bombay_models.Trades.objects.all()
    trades_serializer = bombay_serializer.TradesSerializer(all_trades, many=True)
    return Response(trades_serializer.data)
