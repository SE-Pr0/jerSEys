# jerSEys Backend

This folder contains the backend foundation for the `jerSEys` project, along with existing supporting folders such as `database`, `docs`, `scraper`, and `scripts`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell you can use:

```powershell
Copy-Item .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

## Health Check

Once the server is running, test the health route at:

`http://localhost:5000/api/health`

## Product API

All product routes are available under `http://localhost:5000/api/products`.

### `GET /api/products`

Returns all products with optional filters:

- `search`
- `category`
- `team`
- `sport`
- `minPrice`
- `maxPrice`
- `sort`

Examples:

```http
GET /api/products
GET /api/products?search=messi
GET /api/products?category=Football&team=Barcelona
GET /api/products?sport=Football&minPrice=20&maxPrice=100&sort=price_asc
```

Supported sort values:

- `newest`
- `oldest`
- `price_asc`
- `price_desc`
- `name_asc`
- `name_desc`

### `GET /api/products/:id`

Returns one product by ID. If the `product_images` table exists, the response also includes an `images` array.

Example:

```http
GET /api/products/1
```

### `POST /api/products`

Protected admin route. Send a Bearer token for an admin user.

Example body:

```json
{
  "name": "Inter Miami 24/25 Home Jersey",
  "description": "Pink home jersey inspired by the latest season.",
  "price": 79.99,
  "stock": 15,
  "category": "Football",
  "team": "Inter Miami",
  "sport": "Football",
  "size": "L",
  "image_url": "https://example.com/images/inter-miami-home.jpg"
}
```

### `PUT /api/products/:id`

Protected admin route. Replaces the editable product fields.

Example body:

```json
{
  "name": "Inter Miami 24/25 Home Jersey",
  "description": "Updated product description.",
  "price": 74.99,
  "stock": 22,
  "category": "Football",
  "team": "Inter Miami",
  "sport": "Football",
  "size": "M",
  "image_url": "https://example.com/images/inter-miami-home-v2.jpg"
}
```

### `PATCH /api/products/:id/stock`

Protected admin route for stock only.

Example body:

```json
{
  "stock": 30
}
```

### `DELETE /api/products/:id`

Protected admin route.

Example:

```http
DELETE /api/products/1
```

## Cart API

All cart routes are available under `http://localhost:5000/api/cart`.

These routes are protected and require a Bearer token for a logged-in user.

### `GET /api/cart`

Returns the current logged-in user's cart items.

Example:

```http
GET /api/cart
```

Response item shape:

```json
{
  "id": 1,
  "product_id": 12,
  "name": "Chicago Bulls Swingman Jersey",
  "price": "89.99",
  "image_url": "https://example.com/images/bulls.jpg",
  "quantity": 2,
  "stock": 8
}
```

### `POST /api/cart`

Adds a product to the logged-in user's cart. If the product is already in the cart, the quantity is increased.

Example body:

```json
{
  "product_id": 12,
  "quantity": 2
}
```

### `PUT /api/cart/:itemId`

Updates the quantity of one cart item owned by the logged-in user.

Example body:

```json
{
  "quantity": 3
}
```

### `DELETE /api/cart/:itemId`

Deletes one cart item owned by the logged-in user.

Example:

```http
DELETE /api/cart/5
```

### `DELETE /api/cart`

Clears the logged-in user's cart.

Example:

```http
DELETE /api/cart
```

## Orders API

All order routes are available under `http://localhost:5000/api/orders`.

These routes are protected and require a Bearer token for a logged-in user.

### `POST /api/orders`

Places an order using the current logged-in user's cart.

Behavior:

- Returns an error if the cart is empty
- Checks stock for every cart item
- Creates an order with status `pending`
- Inserts matching `order_items`
- Reduces product stock
- Clears the user's cart
- Uses a transaction so all changes succeed or roll back together

Example:

```http
POST /api/orders
```

No request body is required.

### `GET /api/orders`

Returns the current logged-in user's order history, sorted newest first.

Example:

```http
GET /api/orders
```

### `GET /api/orders/:id`

Returns one order with its items and product info.

Example:

```http
GET /api/orders/1
```

Response shape:

```json
{
  "id": 1,
  "user_id": 4,
  "total_price": "179.98",
  "status": "pending",
  "created_at": "2026-04-26T12:00:00.000Z",
  "items": [
    {
      "id": 1,
      "product_id": 12,
      "name": "Chicago Bulls Swingman Jersey",
      "image_url": "https://example.com/images/bulls.jpg",
      "quantity": 2,
      "price": "89.99"
    }
  ]
}
```

### `PATCH /api/orders/:id/cancel`

Cancels one pending order owned by the logged-in user.

Behavior:

- Only the owner can cancel
- Only `pending` orders can be cancelled
- Product stock is restored
- Uses a transaction

Example:

```http
PATCH /api/orders/1/cancel
```

No request body is required.

## Trade Marketplace API

All trade marketplace routes are available under `http://localhost:5000/api/trades`.

Public routes:

- `GET /api/trades`
- `GET /api/trades/:id`

Protected routes require a Bearer token for a logged-in user:

- `POST /api/trades`
- `GET /api/trades/my-listings`
- `POST /api/trades/:id/request`
- `GET /api/trades/requests/received`
- `GET /api/trades/requests/sent`
- `PATCH /api/trades/request/:requestId/accept`
- `PATCH /api/trades/request/:requestId/reject`

### `POST /api/trades`

Creates a trade listing for the logged-in user.

Behavior:

- Saves `user_id` from the logged-in user
- Saves the listing with status `pending`

Example body:

```json
{
  "title": "Swap my Lakers jersey",
  "description": "Looking to trade a size L Lakers jersey for a Bulls jersey in good condition."
}
```

### `GET /api/trades`

Returns all approved trade listings with owner information, sorted newest first.

Example:

```http
GET /api/trades
```

### `GET /api/trades/my-listings`

Returns all trade listings created by the logged-in user, sorted newest first.

Example:

```http
GET /api/trades/my-listings
```

### `GET /api/trades/:id`

Returns one approved trade listing by ID with owner information.

Example:

```http
GET /api/trades/3
```

### `POST /api/trades/:id/request`

Sends a trade request for an approved listing.

Behavior:

- Prevents requesting your own listing
- Prevents duplicate pending requests from the same user

Example:

```http
POST /api/trades/3/request
```

No request body is required.

### `GET /api/trades/requests/received`

Returns all trade requests received on the logged-in user's listings.

Example:

```http
GET /api/trades/requests/received
```

### `GET /api/trades/requests/sent`

Returns all trade requests sent by the logged-in user.

Example:

```http
GET /api/trades/requests/sent
```

### `PATCH /api/trades/request/:requestId/accept`

Accepts one pending trade request if the logged-in user owns the listing.

Behavior:

- Only the listing owner can accept
- Marks the selected request as `accepted`
- Marks the listing as `closed`
- Rejects any other pending requests for that listing

Example:

```http
PATCH /api/trades/request/7/accept
```

No request body is required.

### `PATCH /api/trades/request/:requestId/reject`

Rejects one pending trade request if the logged-in user owns the listing.

Example:

```http
PATCH /api/trades/request/7/reject
```

No request body is required.

## Product Migration

If your database already exists from an older schema, run:

```bash
mysql -u your_user -p < database/product_migration.sql
```

## Trade Listing Status Update

If your database already exists, update the `trade_listings.status` enum to support closed listings:

```sql
ALTER TABLE trade_listings
MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'closed') NOT NULL DEFAULT 'pending';
```
