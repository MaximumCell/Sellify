# 🔧 Sellify API Documentation

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All protected endpoints require authentication via JWT tokens sent as HTTP-only cookies.

### Authentication Headers

```
Cookie: accessToken=<jwt_token>; refreshToken=<refresh_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Authentication Endpoints

### POST /auth/signup

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

### POST /auth/login

Authenticate user and get access tokens.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

### POST /auth/logout

Logout user and invalidate tokens.

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

### GET /auth/profile

Get current user profile (Protected).

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

## Product Endpoints

### GET /products

Get all products with optional filtering.

**Query Parameters:**

- `category` (optional): Filter by category
- `featured` (optional): Filter featured products
- `limit` (optional): Limit number of results
- `page` (optional): Page number for pagination

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "product_id",
        "name": "Product Name",
        "description": "Product description",
        "price": 29.99,
        "image": "https://cloudinary.com/image.jpg",
        "category": "t-shirts",
        "isFeatured": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### GET /products/featured

Get featured products only.

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      // Featured products array
    ]
  }
}
```

### GET /products/category/:category

Get products by category.

**Parameters:**

- `category`: Product category (e.g., "t-shirts", "jeans")

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      // Products in category
    ]
  }
}
```

### POST /products

Create a new product (Admin only).

**Request Body:**

```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 39.99,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "category": "t-shirts",
  "isFeatured": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "new_product_id",
      "name": "New Product",
      "description": "Product description",
      "price": 39.99,
      "image": "https://cloudinary.com/image.jpg",
      "category": "t-shirts",
      "isFeatured": true
    }
  }
}
```

### PUT /products/:id

Update a product (Admin only).

**Parameters:**

- `id`: Product ID

**Request Body:**

```json
{
  "name": "Updated Product Name",
  "price": 49.99,
  "isFeatured": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      // Updated product data
    }
  }
}
```

### DELETE /products/:id

Delete a product (Admin only).

**Parameters:**

- `id`: Product ID

**Response:**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### PATCH /products/:id/toggle-featured

Toggle featured status of a product (Admin only).

**Parameters:**

- `id`: Product ID

**Response:**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      // Updated product with toggled featured status
    }
  }
}
```

## Cart Endpoints

### GET /cart

Get user's cart items (Protected).

**Response:**

```json
{
  "success": true,
  "data": {
    "cartItems": [
      {
        "_id": "item_id",
        "quantity": 2,
        "product": {
          "_id": "product_id",
          "name": "Product Name",
          "price": 29.99,
          "image": "https://cloudinary.com/image.jpg"
        }
      }
    ]
  }
}
```

### POST /cart

Add item to cart (Protected).

**Request Body:**

```json
{
  "productId": "product_id",
  "quantity": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cartItems": [
      // Updated cart items
    ]
  }
}
```

### DELETE /cart

Remove item from cart (Protected).

**Request Body:**

```json
{
  "productId": "product_id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "cartItems": [
      // Updated cart items
    ]
  }
}
```

### PUT /cart/:id

Update cart item quantity (Protected).

**Parameters:**

- `id`: Product ID

**Request Body:**

```json
{
  "quantity": 3
}
```

**Response:**

```json
{
  "success": true,
  "message": "Cart updated successfully",
  "data": {
    "cartItems": [
      // Updated cart items
    ]
  }
}
```

## Payment Endpoints

### POST /payment/create-checkout-session

Create Stripe checkout session (Protected).

**Request Body:**

```json
{
  "products": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 29.99,
      "image": "https://cloudinary.com/image.jpg",
      "quantity": 2
    }
  ],
  "couponCode": "SAVE20"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_stripe_session_id",
    "url": "https://checkout.stripe.com/pay/cs_stripe_session_id"
  }
}
```

### POST /payment/checkout-success

Handle successful payment (Protected).

**Request Body:**

```json
{
  "sessionId": "cs_stripe_session_id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "order": {
      "_id": "order_id",
      "user": "user_id",
      "products": [
        // Ordered products
      ],
      "totalAmount": 59.98,
      "stripeSessionId": "cs_stripe_session_id"
    }
  }
}
```

## Coupon Endpoints

### GET /coupons

Get user's coupon (Protected).

**Response:**

```json
{
  "success": true,
  "data": {
    "coupon": {
      "_id": "coupon_id",
      "code": "SAVE20",
      "discountPercentage": 20,
      "expirationDate": "2024-12-31T23:59:59Z",
      "isActive": true,
      "userId": "user_id"
    }
  }
}
```

### POST /coupons/validate

Validate coupon code (Protected).

**Request Body:**

```json
{
  "code": "SAVE20"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "coupon": {
      "_id": "coupon_id",
      "code": "SAVE20",
      "discountPercentage": 20,
      "expirationDate": "2024-12-31T23:59:59Z",
      "isActive": true
    }
  }
}
```

## Analytics Endpoints

### GET /analytics

Get analytics data (Admin only).

**Response:**

```json
{
  "success": true,
  "message": "Analytics data fetched successfully",
  "data": {
    "analyticsData": {
      "user": 150,
      "product": 25,
      "sales": 75,
      "revenue": 2500.5
    },
    "dailySalesData": [
      {
        "date": "2024-01-01",
        "sales": 10,
        "revenue": 299.9
      },
      {
        "date": "2024-01-02",
        "sales": 15,
        "revenue": 449.85
      }
    ]
  }
}
```

## Error Codes

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Messages

- `"Invalid credentials"` - Login failed
- `"User already exists"` - Email already registered
- `"Product not found"` - Product doesn't exist
- `"Insufficient permissions"` - Admin access required
- `"Invalid coupon code"` - Coupon not valid/expired
- `"Cart is empty"` - No items in cart for checkout

## Rate Limiting

### Limits

- **Authentication endpoints**: 10 requests per minute
- **General endpoints**: 100 requests per minute
- **Admin endpoints**: 50 requests per minute

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

### Request Parameters

```
?page=1&limit=10
```

### Response Headers

```
X-Total-Count: 150
X-Page-Count: 15
X-Current-Page: 1
X-Per-Page: 10
```

## Webhooks

### Stripe Webhook

**Endpoint**: `POST /payment/webhook`

**Events Handled**:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

**Security**: Webhook signature verification required

## Testing

### Authentication

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use cookies from login response for subsequent requests
```

### Products

```bash
# Get all products
curl http://localhost:5000/api/products

# Create product (Admin)
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<token>" \
  -d '{"name":"Test Product","description":"Test","price":29.99,"category":"t-shirts","image":"base64image"}'
```

### Cart

```bash
# Add to cart
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<token>" \
  -d '{"productId":"product_id","quantity":1}'
```

This API documentation provides comprehensive information for integrating with the Sellify backend services.
