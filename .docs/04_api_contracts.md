# 04 — API Contracts

> **Document Status:** Definitive REST API endpoint reference for all modules. Base URL: `/api/v1`.

---

## 1. Global Conventions

| Aspect | Convention |
|---|---|
| **Format** | JSON (`application/json`) |
| **Auth Header** | `Authorization: Bearer <firebase_id_token>` |
| **Success Response** | `{ "data": ..., "message": "..." }` |
| **Error Response** | `{ "statusCode": 4xx/5xx, "message": "...", "error": "..." }` |
| **Pagination** | Query params: `?page=1&limit=20`. Response: `{ "data": [...], "meta": { "page", "limit", "total", "totalPages" } }` |
| **Date Format** | ISO 8601 (`2026-03-18T10:00:00.000Z`) |

---

## 2. Auth Endpoints

### `POST /auth/login`

Called after Firebase client-side authentication. Creates or retrieves the user record in our database.

**Headers:** `Authorization: Bearer <firebase_id_token>`

**Request Body:**
```json
{
  "displayName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+84901234567"
}
```

**Response `200 OK`:**
```json
{
  "data": {
    "id": "uuid",
    "firebaseUid": "firebase_uid_string",
    "email": "john@example.com",
    "displayName": "John Doe",
    "role": "STORE_OWNER",
    "storeId": "uuid-or-null",
    "isActive": true
  },
  "message": "Login successful"
}
```

**Logic:** Verify token → Find user by `firebase_uid` → If not found, create with `STORE_OWNER` role → Return user.

### `GET /auth/me`

Returns the currently authenticated user's profile.

**Response `200 OK`:** Same shape as login response `data`.

---

## 3. Users Endpoints (Admin Only)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/users` | ADMIN | List all users (paginated) |
| `GET` | `/users/:id` | ADMIN | Get user by ID |
| `PATCH` | `/users/:id` | ADMIN | Update user (role, store assignment, active status) |
| `DELETE` | `/users/:id` | ADMIN | Soft-delete / deactivate user |

### `PATCH /users/:id` — Assign Store & Role

**Request Body:**
```json
{
  "role": "STORE_OWNER",
  "storeId": "uuid-of-store",
  "isActive": true
}
```

**Response `200 OK`:**
```json
{
  "data": { "id": "uuid", "email": "...", "role": "STORE_OWNER", "storeId": "uuid", "isActive": true },
  "message": "User updated"
}
```

---

## 4. Stores Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/stores` | ADMIN | Create a new store |
| `GET` | `/stores` | ADMIN | List all stores (paginated) |
| `GET` | `/stores/:id` | ADMIN, STORE_OWNER (own) | Get store details |
| `PATCH` | `/stores/:id` | ADMIN | Update store |
| `DELETE` | `/stores/:id` | ADMIN | Delete store |

### `POST /stores`

**Request Body:**
```json
{
  "name": "Sparkle Clean Laundry",
  "address": "123 Main St, Ho Chi Minh City",
  "phone": "+84288881234",
  "email": "sparkle@example.com"
}
```

**Response `201 Created`:**
```json
{
  "data": { "id": "uuid", "name": "Sparkle Clean Laundry", "address": "...", "phone": "...", "email": "...", "createdAt": "..." },
  "message": "Store created"
}
```

---

## 5. Customers Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/customers` | ADMIN, STORE_OWNER | Create customer (auto-scoped to user's store) |
| `GET` | `/customers` | ADMIN, STORE_OWNER | List customers (filtered by store) |
| `GET` | `/customers/:id` | ADMIN, STORE_OWNER | Get customer details |
| `PATCH` | `/customers/:id` | ADMIN, STORE_OWNER | Update customer |
| `DELETE` | `/customers/:id` | ADMIN, STORE_OWNER | Delete customer |
| `GET` | `/customers/search?phone=...` | ADMIN, STORE_OWNER | Search customer by phone |

### `POST /customers`

**Request Body:**
```json
{
  "name": "Nguyen Van A",
  "phone": "+84901234567",
  "email": "a@example.com",
  "address": "456 Le Loi, District 1",
  "notes": "VIP customer, prefers express service"
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "id": "uuid",
    "storeId": "uuid",
    "name": "Nguyen Van A",
    "phone": "+84901234567",
    "email": "a@example.com",
    "address": "456 Le Loi, District 1",
    "notes": "VIP customer, prefers express service",
    "createdAt": "..."
  },
  "message": "Customer created"
}
```

---

## 6. Services Endpoints (Pricing Catalog)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/services` | ADMIN, STORE_OWNER | Create service |
| `GET` | `/services` | ADMIN, STORE_OWNER | List services (filtered by store) |
| `GET` | `/services/:id` | ADMIN, STORE_OWNER | Get service details |
| `PATCH` | `/services/:id` | ADMIN, STORE_OWNER | Update service |
| `DELETE` | `/services/:id` | ADMIN, STORE_OWNER | Deactivate service (`isActive = false`) |

### `POST /services`

**Request Body:**
```json
{
  "name": "Wash & Fold",
  "description": "Standard wash and fold service",
  "unitType": "KG",
  "pricePerUnit": 25000,
  "isActive": true
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "id": "uuid",
    "storeId": "uuid",
    "name": "Wash & Fold",
    "unitType": "KG",
    "pricePerUnit": 25000,
    "isActive": true,
    "createdAt": "..."
  },
  "message": "Service created"
}
```

---

## 7. Orders Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/orders` | ADMIN, STORE_OWNER | Create order with items |
| `GET` | `/orders` | ADMIN, STORE_OWNER | List orders (filtered, paginated) |
| `GET` | `/orders/:id` | ADMIN, STORE_OWNER | Get order with items |
| `PATCH` | `/orders/:id` | ADMIN, STORE_OWNER | Update order details |
| `PATCH` | `/orders/:id/status` | ADMIN, STORE_OWNER | Update order status |
| `DELETE` | `/orders/:id` | ADMIN, STORE_OWNER | Cancel order |

### Query Filters for `GET /orders`

```
?page=1&limit=20&status=PENDING&customerId=uuid&from=2026-03-01&to=2026-03-18&search=ORD-2026
```

### `POST /orders`

**Request Body:**
```json
{
  "customerId": "uuid",
  "pickupDate": "2026-03-20T10:00:00.000Z",
  "notes": "Handle with care",
  "items": [
    { "serviceId": "uuid", "quantity": 3.5, "notes": "Delicate fabrics" },
    { "serviceId": "uuid", "quantity": 2, "notes": null }
  ]
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-20260318-0001",
    "storeId": "uuid",
    "customerId": "uuid",
    "status": "PENDING",
    "totalAmount": 137500,
    "pickupDate": "2026-03-20T10:00:00.000Z",
    "notes": "Handle with care",
    "items": [
      { "id": "uuid", "serviceId": "uuid", "quantity": 3.5, "unitPrice": 25000, "subtotal": 87500 },
      { "id": "uuid", "serviceId": "uuid", "quantity": 2, "unitPrice": 25000, "subtotal": 50000 }
    ],
    "customer": { "id": "uuid", "name": "Nguyen Van A", "phone": "+84901234567" },
    "createdAt": "..."
  },
  "message": "Order created"
}
```

### `PATCH /orders/:id/status`

**Request Body:**
```json
{ "status": "PROCESSING" }
```

**Valid Transitions:**
- `PENDING` → `PROCESSING` / `CANCELLED`
- `PROCESSING` → `READY_FOR_PICKUP` / `CANCELLED`
- `READY_FOR_PICKUP` → `COMPLETED` / `CANCELLED`
- `COMPLETED` → *(terminal)*
- `CANCELLED` → *(terminal)*

---

## 8. Analytics Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/analytics/dashboard` | ADMIN, STORE_OWNER | Dashboard KPI summary |
| `GET` | `/analytics/revenue` | ADMIN, STORE_OWNER | Revenue over time |
| `GET` | `/analytics/orders` | ADMIN, STORE_OWNER | Order stats by status |
| `GET` | `/analytics/services` | ADMIN, STORE_OWNER | Top services by revenue |
| `GET` | `/analytics/export` | ADMIN, STORE_OWNER | Export data as Excel file |

### `GET /analytics/dashboard?from=2026-03-01&to=2026-03-18`

**Response `200 OK`:**
```json
{
  "data": {
    "totalRevenue": 15750000,
    "totalOrders": 142,
    "completedOrders": 120,
    "pendingOrders": 15,
    "cancelledOrders": 7,
    "newCustomers": 23,
    "averageOrderValue": 110915,
    "revenueGrowthPercent": 12.5
  }
}
```

### `GET /analytics/revenue?from=2026-03-01&to=2026-03-18&groupBy=day`

**`groupBy`**: `day` | `week` | `month`

**Response `200 OK`:**
```json
{
  "data": [
    { "date": "2026-03-01", "revenue": 875000, "orderCount": 8 },
    { "date": "2026-03-02", "revenue": 1250000, "orderCount": 12 }
  ]
}
```

### `GET /analytics/services?from=...&to=...&limit=5`

**Response `200 OK`:**
```json
{
  "data": [
    { "serviceId": "uuid", "serviceName": "Wash & Fold", "totalRevenue": 8500000, "totalOrders": 85 },
    { "serviceId": "uuid", "serviceName": "Dry Clean", "totalRevenue": 4200000, "totalOrders": 35 }
  ]
}
```

### `GET /analytics/export?from=...&to=...&type=orders`

**`type`**: `orders` | `revenue` | `customers`

**Response:** `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` — binary Excel file download.

---

> **Previous:** [03_ui_ux_guidelines.md](./03_ui_ux_guidelines.md) | **Next:** [05_phased_implementation_plan.md](./05_phased_implementation_plan.md)
