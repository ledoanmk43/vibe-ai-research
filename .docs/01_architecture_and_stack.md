# 01 — Architecture & Tech Stack

> **Document Status:** Definitive reference for all technology choices, versions, multi-tenancy model, and environment configuration.

---

## 1. Technology Versions

| Layer | Technology | Exact Version | Notes |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | `15.x` (latest stable) | Using the App Router exclusively; no Pages Router. |
| **UI Library** | Material UI (MUI) | `6.x` | `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`. |
| **Charting** | Recharts | `2.x` | Used for Analytics Dashboard only. |
| **Backend Framework** | NestJS | `11.x` | Modular architecture with Guards, Interceptors, Pipes. |
| **ORM** | TypeORM | `0.3.x` | DataSource-based configuration; Repository pattern. |
| **Database** | PostgreSQL | `16.x` | JSONB used sparingly; relational model primary. |
| **Authentication** | Firebase Admin SDK | `13.x` | Server-side token verification only. |
| **Firebase Client SDK** | Firebase JS SDK | `11.x` | Client-side Google OAuth & Phone OTP flows. |
| **Containerization** | Docker & Docker Compose | Engine `27.x` / Compose `2.x` | Local development environment. |
| **Node.js** | Node.js | `22.x LTS` | Runtime for both frontend and backend. |
| **Package Manager** | pnpm | `9.x` | Workspace-level monorepo support. |

---

## 2. Repository Structure (Monorepo)

```
vibe-ai-research/
├── .docs/                    # This documentation suite
├── apps/
│   ├── web/                  # Next.js 15 frontend application
│   │   ├── src/
│   │   │   ├── app/          # App Router pages & layouts
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── lib/          # Utilities, Firebase client init, API client
│   │   │   ├── theme/        # MUI theme configuration
│   │   │   └── types/        # Shared TypeScript types/interfaces
│   │   ├── public/           # Static assets
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── api/                  # NestJS backend application
│       ├── src/
│       │   ├── auth/         # Auth module (Firebase verification, guards)
│       │   ├── users/        # Users module
│       │   ├── stores/       # Stores module
│       │   ├── customers/    # Customers module
│       │   ├── services/     # Services module (laundry service catalog)
│       │   ├── orders/       # Orders module
│       │   ├── analytics/    # Analytics module
│       │   ├── common/       # Shared decorators, pipes, filters, interceptors
│       │   ├── database/     # TypeORM DataSource, entities, migrations
│       │   ├── config/       # Configuration module (env validation)
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/
│       ├── tsconfig.json
│       └── package.json
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

---

## 3. Multi-Tenant RBAC Model

### 3.1 Roles

| Role | Enum Value | Description |
|---|---|---|
| **Administrator** | `ADMIN` | Full system access. Can create/manage stores, assign Store Owners, view cross-store analytics. Sees all data. |
| **Store Owner** | `STORE_OWNER` | Scoped to their assigned `store_id`. Can manage customers, services, orders, and view analytics **only** for their own store. |

### 3.2 Multi-Tenancy via `store_id`

- Every data-bearing entity (`customers`, `services`, `orders`, `order_items`) carries a `store_id` foreign key.
- **ADMIN** requests bypass the store filter — they can query any or all stores.
- **STORE_OWNER** requests are **automatically filtered** at the service/repository layer by their assigned `store_id`. This is enforced by a custom NestJS interceptor (`StoreFilterInterceptor`) that injects the user's `store_id` into every query.

### 3.3 Auth Flow

```
┌───────────────┐        ┌──────────────┐        ┌──────────────┐
│  Next.js App  │──(1)──▶│ Firebase Auth│──(2)──▶│   Google /   │
│  (Client SDK) │◀──(3)──│  Client SDK  │◀──────│   Phone OTP  │
└───────┬───────┘        └──────────────┘        └──────────────┘
        │ (4) Send ID Token in
        │     Authorization: Bearer <token>
        ▼
┌───────────────┐        ┌──────────────┐
│  NestJS API   │──(5)──▶│ Firebase     │
│  (AuthGuard)  │◀──(6)──│ Admin SDK    │
└───────┬───────┘        └──────────────┘
        │ (7) Lookup user in DB by firebase_uid
        │     Attach user entity + role to request
        ▼
┌───────────────┐
│  Route Handler│  ← Protected by @Roles() decorator
└───────────────┘
```

1. User clicks "Sign in with Google" or enters Phone Number.
2. Firebase Client SDK handles OAuth redirect / OTP verification.
3. Firebase returns an **ID Token** (JWT).
4. Next.js sends the ID Token to NestJS on every API request via `Authorization: Bearer <token>`.
5. `AuthGuard` calls Firebase Admin SDK `verifyIdToken(token)`.
6. Firebase Admin SDK returns the decoded token with `uid`.
7. NestJS looks up the `users` table by `firebase_uid`, attaches the full user entity (including `role` and `store_id`) to the request object.
8. `RolesGuard` checks if the user's role is allowed for the endpoint via `@Roles(Role.ADMIN)` decorator.

### 3.4 Guards & Decorators

| Component | Purpose |
|---|---|
| `@UseGuards(AuthGuard)` | Verifies Firebase ID token; rejects unauthenticated requests with `401`. |
| `@UseGuards(RolesGuard)` | Checks user role against `@Roles()` decorator; rejects unauthorized requests with `403`. |
| `@Roles(Role.ADMIN)` | Parameter decorator specifying which roles can access a route. |
| `@CurrentUser()` | Parameter decorator extracting the authenticated user entity from the request. |
| `StoreFilterInterceptor` | Automatically injects `store_id` filter for `STORE_OWNER` queries. |

---

## 4. Environment Variables

### 4.1 Backend (`apps/api/.env`)

```env
# ─── Application ─────────────────────────────────────
NODE_ENV=development                    # development | production
PORT=4000                               # API server port
API_PREFIX=api/v1                       # Global route prefix

# ─── Database ────────────────────────────────────────
DB_HOST=localhost                        # PostgreSQL host (or Docker service name)
DB_PORT=5432                             # PostgreSQL port
DB_USERNAME=laundry_user                 # Database user
DB_PASSWORD=laundry_secret               # Database password
DB_NAME=laundry_crm                     # Database name
DB_SYNCHRONIZE=true                     # TypeORM synchronize (true ONLY in dev)
DB_LOGGING=true                         # TypeORM query logging

# ─── Firebase Admin ──────────────────────────────────
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ─── CORS ────────────────────────────────────────────
CORS_ORIGIN=http://localhost:3000        # Allowed origin for CORS
```

### 4.2 Frontend (`apps/web/.env.local`)

```env
# ─── Next.js ─────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# ─── Firebase Client ─────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4.3 Docker Compose (`docker-compose.yml` root)

```env
# Passed via .env at project root
POSTGRES_USER=laundry_user
POSTGRES_PASSWORD=laundry_secret
POSTGRES_DB=laundry_crm
```

---

## 5. Production Infrastructure

| Component | Service | Notes |
|---|---|---|
| **Frontend** | Render (Static Site / Web Service) | Next.js deployed as a Node.js web service. |
| **Backend** | Render (Web Service) | NestJS deployed as a Docker-based web service. |
| **Database** | Neon _or_ Supabase | Managed PostgreSQL. Connection string replaces local DB vars. |
| **Auth** | Firebase Auth | Same Firebase project for all environments. |

### 5.1 Production Environment Overrides

- `DB_SYNCHRONIZE=false` — **Never** synchronize schema in production; use TypeORM migrations.
- `DB_LOGGING=false` — Disable verbose logging.
- `NODE_ENV=production` — Enables production optimizations in both Next.js and NestJS.
- `CORS_ORIGIN` — Set to the production frontend URL.

---

## 6. Docker Compose (Local Development)

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: laundry_crm_db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-laundry_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-laundry_secret}
      POSTGRES_DB: ${POSTGRES_DB:-laundry_crm}
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: laundry_crm_api
    restart: unless-stopped
    ports:
      - "4000:4000"
    depends_on:
      - postgres
    env_file:
      - ./apps/api/.env
    environment:
      DB_HOST: postgres

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: laundry_crm_web
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - api
    env_file:
      - ./apps/web/.env.local

volumes:
  pgdata:
```

---

> **Next:** [02_database_schema.md](./02_database_schema.md)
