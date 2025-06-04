# Orderbook


## Overview
The order book (Bombay Exchange) example is a simple implementation of a stock trading platform. It allows users to create accounts, login, and place orders for stocks. The order book displays the current state of the order book, including the best bid and ask prices, as well as the order history.

## Assumptions
- All live orders can be stored in a Redis database.
- Any transaction is logged as a trade.
- Any user can see everyone else's orders and previous trades.
- An user can buy and sell the same stock at the same time (which might cause them to buy their stocks).

## Installation
To run the order book example, you need to have the following dependencies installed:
- `docker`
- `python3`
- `pip`
- `npm`
- `node`

To run the example, follow these steps:

```bash
# For backend
# Step 1: Start the Redis server
docker run -d --name redis -p 6379:6379 redis
# Step 2: Install the required Python packages
pip install -r requirements.txt
# Step 3: Make the django migrations
python manage.py makemigrations
python manage.py migrate
# Step 4: Populate the database with initial data
python manage.py add_stocks
# Step 5: Start the Django server
python manage.py runserver

# For frontend
#Step 0: Go to trading platform
cd frontend/trading-platform
# Step 1: Install the required Node.js packages
npm install
# Step 2: Start the React server
npm run dev
# Step 3: Open the frontend in your browser
# http://localhost:5673
```


## Architecture
The order book example consists of a Django backend and a React frontend. The backend is responsible for handling the order book logic, while the frontend provides a user interface for interacting with the order book.

User can create new accounts, login, and place orders. The order book will display the current state of the order book, including the best bid and ask prices, as well as the order history.

The user validation and trades tracking is done via sqllite database. When the use views existing bids, these are fetched from the database and displayed in the order book.

The order matching is done via Redis. When a new order is placed, the backend will check if there are any matching orders in the order book. This is done by using Redis Sorted Sets to store sorted Sets for each stock. The backend will use the `ZADD` command to add new orders to the sorted set, and the `ZPOPMAX` command to pop the order with the highest buy price or lowest sell price. 

