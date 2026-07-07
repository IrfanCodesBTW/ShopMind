# ShopMind API Specification

## Overview

ShopMind exposes a RESTful API for managing voice-driven merchant transactions, customer credit tracking, inventory management, and dashboard analytics.

- **Base URL**: `https://api.shopmind.app/v1`
- **Protocol**: HTTPS only
- **Content-Type**: `application/json` (unless specified otherwise)
- **API Version**: v1

---

## Authentication

ShopMind uses **Supabase Auth** with JWT Bearer tokens.

### How It Works

1. Client authenticates via `/auth/login` or `/auth/signup`
2. Supabase returns an access token (JWT) and refresh token
3. Include the access token in all subsequent requests

### Header Format

```
Authorization: Bearer <access_token>
```

### Token Lifecycle

| Token | Duration | Refresh |
|-------|----------|---------|
| Access Token | 1 hour | Via refresh token |
| Refresh Token | 7 days | Re-login required |

---

## Common Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error description",
    "details": [ ... ]
  }
}
```

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|-----------|-------------|
| 400 | `VALIDATION_ERROR` | Request body failed validation |
| 400 | `INVALID_AUDIO` | Audio file format not supported or corrupted |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 401 | `TOKEN_EXPIRED` | Access token has expired |
| 403 | `FORBIDDEN` | User does not have permission for this resource |
| 404 | `NOT_FOUND` | Requested resource does not exist |
| 409 | `CONFLICT` | Resource already exists (duplicate) |
| 422 | `LOW_CONFIDENCE` | AI confidence score below threshold, needs review |
| 429 | `RATE_LIMITED` | Too many requests, slow down |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 503 | `PROVIDER_UNAVAILABLE` | AI provider is temporarily unavailable |

---

## Rate Limiting

| Tier | Requests/Minute | Burst |
|------|----------------|-------|
| Free | 30 | 10 |
| Pro | 120 | 30 |
| Enterprise | 600 | 100 |

Rate limit headers included in every response:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 27
X-RateLimit-Reset: 1720278000
```

---

## Endpoints

### Auth

#### POST /auth/signup

Create a new merchant account.

**Request:**

```json
{
  "phone": "+919876543210",
  "password": "securePassword123",
  "name": "Ramesh Kumar",
  "shop_name": "Kumar General Store",
  "language_preference": "hi"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "phone": "+919876543210",
      "name": "Ramesh Kumar",
      "shop_name": "Kumar General Store"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "v1.refresh.abc123...",
      "expires_at": 1720281600
    }
  }
}
```

---

#### POST /auth/login

Authenticate an existing merchant.

**Request:**

```json
{
  "phone": "+919876543210",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "phone": "+919876543210",
      "name": "Ramesh Kumar",
      "shop_name": "Kumar General Store"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "v1.refresh.abc123...",
      "expires_at": 1720281600
    }
  }
}
```

---

#### POST /auth/logout

Invalidate the current session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

#### GET /auth/me

Get the current authenticated merchant's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Ramesh Kumar",
    "shop_name": "Kumar General Store",
    "phone": "+919876543210",
    "language_preference": "hi",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-06-20T14:15:00Z"
  }
}
```


---

### Transactions

#### POST /transactions/voice

Upload audio for voice-to-transaction parsing. Accepts multipart form data.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audio` | file | Yes | Audio file (wav, mp3, webm, ogg; max 10MB) |
| `language` | string | No | Override language detection (default: merchant preference) |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
    "intent": "sale",
    "item": "rice",
    "quantity": 5,
    "unit": "kg",
    "amount": 250.00,
    "customer_name": "Suresh",
    "payment_mode": "cash",
    "due_status": "none",
    "confidence_score": 0.92,
    "raw_transcript": "Suresh ko 5 kilo chawal becha 250 rupaye cash mein",
    "provider_used": "openai",
    "status": "pending",
    "created_at": "2025-07-06T12:15:00Z"
  }
}
```

**Error (422 - Low Confidence):**

```json
{
  "success": false,
  "error": {
    "code": "LOW_CONFIDENCE",
    "message": "Could not confidently parse the transaction. Please review.",
    "details": {
      "confidence_score": 0.45,
      "raw_transcript": "... bees kilo ... rupaye ...",
      "suggestions": [
        { "field": "item", "options": ["rice", "wheat"] },
        { "field": "amount", "options": [200, 250] }
      ]
    }
  }
}
```

---

#### POST /transactions/confirm

Confirm a pending transaction (optionally with corrections).

**Headers:** `Authorization: Bearer <token>`

**Request:**

```json
{
  "transaction_id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
  "corrections": {
    "amount": 275.00,
    "item": "basmati rice"
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
    "intent": "sale",
    "item": "basmati rice",
    "quantity": 5,
    "unit": "kg",
    "amount": 275.00,
    "customer_name": "Suresh",
    "payment_mode": "cash",
    "due_status": "none",
    "status": "confirmed",
    "created_at": "2025-07-06T12:15:00Z"
  }
}
```

---

#### GET /transactions

List transactions for the authenticated merchant.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Results per page (max 100) |
| `status` | string | all | Filter by status (pending, confirmed, cancelled) |
| `intent` | string | all | Filter by intent (sale, purchase, credit_given, etc.) |
| `from` | ISO date | - | Start date filter |
| `to` | ISO date | - | End date filter |
| `search` | string | - | Search in item, customer_name, raw_transcript |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
      "intent": "sale",
      "item": "basmati rice",
      "quantity": 5,
      "unit": "kg",
      "amount": 275.00,
      "customer_name": "Suresh",
      "payment_mode": "cash",
      "status": "confirmed",
      "created_at": "2025-07-06T12:15:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 342
  }
}
```

---

#### GET /transactions/:id

Get a single transaction by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
    "merchant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "intent": "sale",
    "item": "basmati rice",
    "quantity": 5,
    "unit": "kg",
    "amount": 275.00,
    "customer_name": "Suresh",
    "payment_mode": "cash",
    "due_status": "none",
    "confidence_score": 0.92,
    "raw_transcript": "Suresh ko 5 kilo chawal becha 250 rupaye cash mein",
    "provider_used": "openai",
    "status": "confirmed",
    "created_at": "2025-07-06T12:15:00Z"
  }
}
```

---

#### PUT /transactions/:id

Update a transaction (only pending or confirmed transactions can be updated).

**Headers:** `Authorization: Bearer <token>`

**Request:**

```json
{
  "item": "premium basmati rice",
  "amount": 300.00,
  "status": "cancelled"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
    "intent": "sale",
    "item": "premium basmati rice",
    "quantity": 5,
    "unit": "kg",
    "amount": 300.00,
    "customer_name": "Suresh",
    "payment_mode": "cash",
    "due_status": "none",
    "status": "cancelled",
    "created_at": "2025-07-06T12:15:00Z"
  }
}
```


---

### Customers

#### GET /customers

List all customers for the authenticated merchant.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Results per page (max 100) |
| `search` | string | - | Search by name or phone |
| `has_credit` | boolean | - | Filter customers with outstanding credit |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "c1d2e3f4-a5b6-7890-cdef-123456789abc",
      "name": "Suresh Patel",
      "phone": "+919123456789",
      "total_credit": 1500.00,
      "total_paid": 8500.00,
      "created_at": "2025-03-10T08:00:00Z",
      "updated_at": "2025-07-05T16:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 45
  }
}
```

---

#### GET /customers/:id

Get detailed customer information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "c1d2e3f4-a5b6-7890-cdef-123456789abc",
    "merchant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Suresh Patel",
    "phone": "+919123456789",
    "total_credit": 1500.00,
    "total_paid": 8500.00,
    "created_at": "2025-03-10T08:00:00Z",
    "updated_at": "2025-07-05T16:30:00Z",
    "recent_transactions": [
      {
        "id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
        "intent": "credit_given",
        "amount": 500.00,
        "created_at": "2025-07-05T16:30:00Z"
      }
    ]
  }
}
```

---

#### GET /customers/:id/credit-history

Get the full credit/debit history for a customer.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Results per page |
| `from` | ISO date | - | Start date filter |
| `to` | ISO date | - | End date filter |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "c1d2e3f4-a5b6-7890-cdef-123456789abc",
      "name": "Suresh Patel",
      "current_balance": 1500.00
    },
    "entries": [
      {
        "id": "l1m2n3o4-p5q6-7890-rstu-vwxyz1234567",
        "type": "credit",
        "amount": 500.00,
        "balance_after": 1500.00,
        "transaction_id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
        "created_at": "2025-07-05T16:30:00Z"
      },
      {
        "id": "m2n3o4p5-q6r7-8901-stuv-wxyz12345678",
        "type": "debit",
        "amount": 1000.00,
        "balance_after": 1000.00,
        "transaction_id": "e6d5c4b3-a2f1-0987-6543-210fedcba987",
        "created_at": "2025-07-01T10:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 23
  }
}
```

---

### Inventory

#### GET /inventory

List all inventory items for the authenticated merchant.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 50 | Results per page (max 200) |
| `search` | string | - | Search by item name |
| `sort` | string | `item_name` | Sort field (item_name, quantity, last_updated) |
| `order` | string | `asc` | Sort order (asc, desc) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "i1n2v3e4-n5t6-7890-abcd-ef1234567890",
      "item_name": "Basmati Rice",
      "quantity": 45.5,
      "unit": "kg",
      "reorder_level": 10,
      "last_updated": "2025-07-06T12:15:00Z"
    },
    {
      "id": "i2n3v4e5-n6t7-8901-bcde-f12345678901",
      "item_name": "Toor Dal",
      "quantity": 8.0,
      "unit": "kg",
      "reorder_level": 15,
      "last_updated": "2025-07-05T09:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 50,
    "total": 87
  }
}
```

---

#### PUT /inventory/:id

Update an inventory item's quantity or reorder level.

**Headers:** `Authorization: Bearer <token>`

**Request:**

```json
{
  "quantity": 50.0,
  "reorder_level": 12
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "i1n2v3e4-n5t6-7890-abcd-ef1234567890",
    "item_name": "Basmati Rice",
    "quantity": 50.0,
    "unit": "kg",
    "reorder_level": 12,
    "last_updated": "2025-07-06T12:20:00Z"
  }
}
```

---

#### GET /inventory/low-stock

Get all items below their reorder level.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "i2n3v4e5-n6t7-8901-bcde-f12345678901",
      "item_name": "Toor Dal",
      "quantity": 8.0,
      "unit": "kg",
      "reorder_level": 15,
      "deficit": 7.0,
      "last_updated": "2025-07-05T09:30:00Z"
    }
  ],
  "meta": {
    "total_low_stock": 3
  }
}
```

---

### Dashboard

#### GET /dashboard/summary

Get aggregated business summary for the authenticated merchant.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `today` | Time period (today, week, month, year) |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "period": "today",
    "total_sales": 12500.00,
    "total_purchases": 3200.00,
    "total_credit_given": 2000.00,
    "total_credit_received": 500.00,
    "net_revenue": 9300.00,
    "transaction_count": 28,
    "top_items": [
      { "item": "Basmati Rice", "quantity_sold": 25, "revenue": 6250.00 },
      { "item": "Toor Dal", "quantity_sold": 10, "revenue": 1800.00 }
    ],
    "outstanding_credit": 45000.00,
    "low_stock_count": 3
  }
}
```

---

#### GET /dashboard/recent-transactions

Get the most recent transactions for quick overview.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Number of transactions (max 50) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
      "intent": "sale",
      "item": "Basmati Rice",
      "amount": 275.00,
      "customer_name": "Suresh",
      "status": "confirmed",
      "created_at": "2025-07-06T12:15:00Z"
    },
    {
      "id": "a9b8c7d6-e5f4-3210-9876-fedcba654321",
      "intent": "credit_given",
      "item": null,
      "amount": 500.00,
      "customer_name": "Meena",
      "status": "pending",
      "created_at": "2025-07-06T12:10:00Z"
    }
  ]
}
```

---

### Admin

#### GET /admin/usage-stats

Get AI API usage statistics. Requires admin role.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `week` | Time period (day, week, month) |
| `provider` | string | all | Filter by provider |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "period": "week",
    "total_requests": 4523,
    "total_tokens": 1250000,
    "success_rate": 0.987,
    "by_provider": [
      {
        "provider": "openai",
        "model": "gpt-4o-mini",
        "requests": 2100,
        "tokens": 680000,
        "success_rate": 0.992,
        "avg_latency_ms": 450
      },
      {
        "provider": "deepgram",
        "model": "nova-2",
        "requests": 2200,
        "tokens": 520000,
        "success_rate": 0.985,
        "avg_latency_ms": 320
      }
    ],
    "by_request_type": [
      { "type": "transcription", "count": 2200 },
      { "type": "parsing", "count": 2100 },
      { "type": "embedding", "count": 223 }
    ]
  }
}
```

---

#### GET /admin/provider-health

Get current health status of AI providers. Requires admin role.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "provider": "openai",
        "status": "healthy",
        "uptime_24h": 0.998,
        "avg_latency_ms": 450,
        "error_rate_1h": 0.002,
        "last_error": null
      },
      {
        "provider": "deepgram",
        "status": "healthy",
        "uptime_24h": 0.995,
        "avg_latency_ms": 320,
        "error_rate_1h": 0.005,
        "last_error": "2025-07-06T08:15:00Z"
      },
      {
        "provider": "gemini",
        "status": "degraded",
        "uptime_24h": 0.920,
        "avg_latency_ms": 890,
        "error_rate_1h": 0.08,
        "last_error": "2025-07-06T12:01:00Z"
      }
    ],
    "active_fallback": {
      "from": "gemini",
      "to": "openai",
      "since": "2025-07-06T11:45:00Z"
    }
  }
}
```
