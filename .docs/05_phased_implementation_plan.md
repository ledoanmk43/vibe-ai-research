# 05 — Phased Implementation Plan

> **Document Status:** Strict, sequential implementation guide. Each phase has a backend and frontend checklist.

> [!CAUTION]
> **RULE: Never proceed to the next phase without explicit user confirmation.** At the end of each phase, stop and ask: *"Phase N is complete. May I proceed to Phase N+1?"*

---

## Phase 1: Foundation

**Goal:** Scaffold the monorepo, connect NestJS to PostgreSQL via TypeORM, verify the Next.js app boots with the MUI theme.

### Backend Checklist

- [ ] Initialize pnpm workspace (`pnpm-workspace.yaml`)
- [ ] Scaffold NestJS app in `apps/api/` (`@nestjs/cli`)
- [ ] Install TypeORM, `pg`, `@nestjs/typeorm`, `@nestjs/config`, `class-validator`, `class-transformer`
- [ ] Create `ConfigModule` with `.env` validation using `Joi`
- [ ] Create `DatabaseModule` with TypeORM `DataSource` configuration
- [ ] Create all 6 entity files: `Store`, `User`, `Customer`, `Service`, `Order`, `OrderItem`
- [ ] Create all 3 enum files: `Role`, `OrderStatus`, `UnitType`
- [ ] Verify `synchronize: true` creates all tables on startup
- [ ] Add global `ValidationPipe` in `main.ts`
- [ ] Add CORS configuration in `main.ts`
- [ ] Create a health-check endpoint `GET /api/v1/health`
- [ ] Write `Dockerfile` for the API

### Frontend Checklist

- [ ] Scaffold Next.js 15 app in `apps/web/` (App Router, TypeScript)
- [ ] Install MUI packages: `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
- [ ] Create MUI theme file at `src/theme/theme.ts` per UI/UX guidelines
- [ ] Create `ThemeProvider` wrapper in the root layout
- [ ] Add Inter font via `next/font/google`
- [ ] Create a basic landing page confirming theme is applied
- [ ] Write `Dockerfile` for the web app

### Infrastructure

- [ ] Create `docker-compose.yml` with PostgreSQL, API, and Web services
- [ ] Create `.env.example` files for API and Web
- [ ] Verify `docker compose up` boots all services and DB tables are created

### ✅ Phase 1 Exit Criteria
- `docker compose up` runs successfully
- `GET /api/v1/health` returns `200`
- Next.js app renders at `localhost:3000` with correct MUI theme colors

> **⏸ STOP — Ask user for confirmation before proceeding to Phase 2.**

---

## Phase 2: Auth & Users

**Goal:** Integrate Firebase Authentication (Google OAuth + Phone OTP), implement RBAC guards, and build the login/register UI.

### Backend Checklist

- [ ] Install `firebase-admin`
- [ ] Create `FirebaseModule` — initialize Firebase Admin SDK from env vars
- [ ] Create `AuthGuard` — verify Firebase ID token, extract `uid`
- [ ] Create `RolesGuard` — check role against `@Roles()` decorator
- [ ] Create `@Roles()` decorator
- [ ] Create `@CurrentUser()` parameter decorator
- [ ] Create `AuthController` with `POST /auth/login` and `GET /auth/me`
- [ ] Create `AuthService` — find or create user by `firebase_uid`
- [ ] Create `UsersModule` with CRUD endpoints (ADMIN only)
- [ ] Create `StoreFilterInterceptor` — auto-inject `store_id` for STORE_OWNER
- [ ] Add global exception filter for Firebase token errors

### Frontend Checklist

- [ ] Install Firebase JS SDK (`firebase`)
- [ ] Create `src/lib/firebase.ts` — initialize Firebase client
- [ ] Create `AuthContext` provider (React Context + `useContext`)
- [ ] Implement Google Sign-In flow
- [ ] Implement Phone Number + OTP Sign-In flow
- [ ] Create Login page with glassmorphism card over gradient background
- [ ] Create API client (`src/lib/api.ts`) with automatic token attachment
- [ ] Implement auth state listener — redirect to dashboard on login
- [ ] Implement protected route wrapper (redirect to login if unauthenticated)
- [ ] Create basic sidebar layout shell (navigation skeleton)

### ✅ Phase 2 Exit Criteria
- User can sign in via Google OAuth and Phone OTP
- Token is sent with API requests and verified by backend
- ADMIN vs STORE_OWNER routes are protected
- Unauthorized access returns `403`

> **⏸ STOP — Ask user for confirmation before proceeding to Phase 3.**

---

## Phase 3: Service Catalog (Pricing Matrix)

**Goal:** Build the CRUD for stores and the laundry service pricing catalog.

### Backend Checklist

- [ ] Create `StoresModule` — full CRUD (ADMIN only for create/update/delete)
- [ ] Create `StoresController` and `StoresService`
- [ ] Create DTOs with validation: `CreateStoreDto`, `UpdateStoreDto`
- [ ] Create `ServicesModule` — full CRUD (scoped by `store_id`)
- [ ] Create `ServicesController` and `ServicesService`
- [ ] Create DTOs: `CreateServiceDto`, `UpdateServiceDto`
- [ ] Implement soft-delete for services (`isActive = false`)
- [ ] Add pagination support to list endpoints

### Frontend Checklist

- [ ] Create Stores management page (ADMIN only) — list, create, edit, delete
- [ ] Create Store form dialog (name, address, phone, email)
- [ ] Create Services page — data table with all services for the store
- [ ] Create Service form dialog (name, description, unit type, price)
- [ ] Implement unit type selector (KG / PIECE / PAIR) with icons
- [ ] Add search/filter on services list
- [ ] Wire up sidebar navigation: Dashboard, Stores (admin), Services
- [ ] Implement loading skeletons for list pages
- [ ] Add success/error toast notifications (`notistack` or MUI Snackbar)

### ✅ Phase 3 Exit Criteria
- Admin can create stores and assign owners
- Store owners can CRUD their service catalog
- Prices display correctly with unit type labels
- Store filter interceptor correctly scopes data

> **⏸ STOP — Ask user for confirmation before proceeding to Phase 4.**

---

## Phase 4: Customer & Order Management

**Goal:** Build the customer database and full order lifecycle (create → status transitions → completion).

### Backend Checklist

- [ ] Create `CustomersModule` — full CRUD (scoped by `store_id`)
- [ ] Create DTOs: `CreateCustomerDto`, `UpdateCustomerDto`
- [ ] Implement phone-based search endpoint
- [ ] Enforce unique constraint on `(store_id, phone)`
- [ ] Create `OrdersModule` — create order with items, list, get, update status
- [ ] Create `OrdersService` — implement order number generation (`ORD-YYYYMMDD-NNNN`)
- [ ] Implement `unit_price` snapshot logic (copy from service at order time)
- [ ] Implement `total_amount` calculation (`SUM(subtotal)`)
- [ ] Implement status transition validation (enforce allowed transitions)
- [ ] Add date-range and status filters to list endpoint
- [ ] Add search by order number

### Frontend Checklist

- [ ] Create Customers page — data table with search by name/phone
- [ ] Create Customer form dialog (name, phone, email, address, notes)
- [ ] Create Customer detail page — profile info + order history
- [ ] Create Orders page — data table with status chips, filters, search
- [ ] Create New Order page/dialog:
  - [ ] Customer selector (search by phone, auto-fill)
  - [ ] Service item rows (select service → auto-fill price → enter quantity)
  - [ ] Dynamic subtotal + total calculation
  - [ ] Pickup date picker
  - [ ] Notes field
- [ ] Create Order detail page — full order info with items table
- [ ] Implement status update buttons (with confirmation dialog)
- [ ] Add order status timeline/stepper visualization
- [ ] Wire sidebar: add Customers and Orders links

### ✅ Phase 4 Exit Criteria
- Full customer CRUD with phone search
- Orders can be created with multiple service items
- Prices are snapshot at order time
- Status transitions are enforced and visualized
- Order number auto-generation works

> **⏸ STOP — Ask user for confirmation before proceeding to Phase 5.**

---

## Phase 5: Analytics Dashboard & Excel Export

**Goal:** Build the analytics dashboard with Recharts and implement Excel export.

### Backend Checklist

- [ ] Create `AnalyticsModule`
- [ ] Implement dashboard KPI query (total revenue, order counts, new customers, avg order value)
- [ ] Implement revenue-over-time query with `groupBy` (day/week/month)
- [ ] Implement top-services-by-revenue query
- [ ] Implement order-status distribution query
- [ ] Install `exceljs` for Excel generation
- [ ] Implement export endpoint — generate `.xlsx` with formatted sheets
- [ ] Add date-range filtering to all analytics queries
- [ ] ADMIN: aggregate across all stores; STORE_OWNER: filtered by `store_id`

### Frontend Checklist

- [ ] Install `recharts`
- [ ] Create Dashboard page as the default landing page after login
- [ ] Build KPI summary cards (total revenue, orders, customers, avg value)
  - [ ] Use glassmorphism card style with gradient accents
  - [ ] Show growth percentage indicators (up/down arrows)
- [ ] Build Revenue chart — `AreaChart` or `LineChart` with gradient fill
- [ ] Build Order Status chart — `PieChart` or `DonutChart`
- [ ] Build Top Services chart — horizontal `BarChart`
- [ ] Add date range picker filter for all charts
- [ ] Implement "Export to Excel" button with loading state
- [ ] Handle file download from API response
- [ ] Add responsive grid layout for dashboard cards

### ✅ Phase 5 Exit Criteria
- Dashboard shows accurate KPIs from real order data
- All 3 charts render correctly with live data
- Date range filter works across all analytics
- Excel export downloads correctly formatted file
- ADMIN sees cross-store data; STORE_OWNER sees only their store

> **⏸ STOP — Ask user for confirmation before proceeding to Phase 6.**

---

## Phase 6: UI Polish & Production Prep

**Goal:** Final polish, responsive testing, error handling, and deployment configuration.

### UI Polish Checklist

- [ ] Audit all pages against UI/UX guidelines (colors, spacing, typography)
- [ ] Add page transition animations (fade + slide)
- [ ] Add skeleton loading states to all list/detail pages
- [ ] Add empty state illustrations for no-data scenarios
- [ ] Verify all status chips use the correct color mapping
- [ ] Test sidebar collapse/expand behavior at all breakpoints
- [ ] Test mobile responsiveness on all pages
- [ ] Add keyboard accessibility (tab navigation, enter to submit)
- [ ] Add proper `<title>` and meta tags per page (SEO)

### Error Handling Checklist

- [ ] Add global error boundary in Next.js
- [ ] Add 404 Not Found page
- [ ] Add user-friendly error messages for all API failures
- [ ] Handle token expiration — auto-refresh or redirect to login
- [ ] Add form validation error messages with MUI `helperText`
- [ ] Add confirmation dialogs before destructive actions (delete, cancel order)

### Production Prep Checklist

- [ ] Set `DB_SYNCHRONIZE=false` for production
- [ ] Generate TypeORM migrations for the complete schema
- [ ] Configure Render web services for API and Web
- [ ] Set up Neon/Supabase PostgreSQL and configure connection string
- [ ] Set all environment variables in Render dashboard
- [ ] Configure production CORS origin
- [ ] Add `helmet` middleware to NestJS for security headers
- [ ] Add rate limiting to auth endpoints
- [ ] Run Lighthouse audit on frontend — target 90+ scores
- [ ] Create production `docker-compose.prod.yml` (optional)
- [ ] Final smoke test on production deployment

### ✅ Phase 6 Exit Criteria
- All pages match the design guidelines
- Responsive on mobile, tablet, and desktop
- Error states are handled gracefully
- Production deployment is live and functional
- Lighthouse Performance/Accessibility scores ≥ 90

> **🎉 PROJECT COMPLETE**

---

> **Previous:** [04_api_contracts.md](./04_api_contracts.md)
