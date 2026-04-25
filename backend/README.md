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

## Product Migration

If your database already exists from an older schema, run:

```bash
mysql -u your_user -p < database/product_migration.sql
```
