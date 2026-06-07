# Inventory & Order Management System (IOMS)

A production-ready full-stack Inventory & Order Management System.

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Recharts
- **Backend:** FastAPI (Python 3.11) + SQLAlchemy 2.0 + Pydantic v2
- **Database:** PostgreSQL 16
- **Auth:** JWT (bcrypt password hashing) with `admin` / `manager` roles
- **Containerization:** Docker & Docker Compose
- **API Docs:** Swagger UI at `/docs`, ReDoc at `/redoc`

> ⚠️ This is a self-hosted FastAPI stack — it does **not** run inside the Lovable preview.
> Run it locally with Docker Compose (recommended) or natively per the instructions below.

---

## Project Structure

```
.
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                # FastAPI app, CORS, lifespan, router mounting
│       ├── seed.py                # Demo data seeding
│       ├── core/                  # config, database, security (JWT/bcrypt)
│       ├── models/                # SQLAlchemy ORM models
│       ├── schemas/               # Pydantic request/response schemas
│       ├── repositories/          # Data-access layer
│       ├── services/              # Business logic (transactions, validation)
│       └── api/
│           ├── deps.py            # Auth & RBAC dependencies
│           └── v1/                # auth, products, customers, orders, dashboard
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── main.tsx, App.tsx
        ├── lib/                   # api client (axios), utils
        ├── store/                 # zustand auth store
        ├── types/                 # shared TS types
        ├── components/
        │   ├── ui/                # Button, Input, Card, Modal, Badge, Pagination…
        │   └── layout/            # AppShell (sidebar + topbar), ProtectedRoute
        └── pages/                 # Login, Dashboard, Products, Customers, Orders, LowStock
```

---

## Quick Start (Docker Compose)

```bash
cp .env.example .env
docker compose up --build
```

Services:

| Service     | URL                                  |
| ----------- | ------------------------------------ |
| Frontend    | http://localhost:5173                |
| Backend API | http://localhost:8000/api/v1         |
| Swagger UI  | http://localhost:8000/docs           |
| Postgres    | localhost:5432 (user `ioms`)         |

The backend auto-creates tables on startup and seeds demo data when `SEED_DEMO_DATA=true` (default).

### Demo accounts

| Role    | Email                | Password     |
| ------- | -------------------- | ------------ |
| Admin   | `admin@ioms.com`   | `admin123`   |
| Manager | `manager@ioms.com` | `manager123` |

> Change `JWT_SECRET` in `.env` (and the demo passwords) before any non-local use.

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit DATABASE_URL to point at your local Postgres
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## Features

### Product Management
- CRUD with **unique SKU**, price ≥ 0, stock ≥ 0 enforced at DB and API layers
- Search by name or SKU, pagination

### Customer Management
- CRUD with **unique email** and email validation (Pydantic `EmailStr`)
- Search by name or email, pagination

### Order Management
- Create order with multiple items (single DB transaction; rolls back on any failure)
- Inventory validation with `SELECT … FOR UPDATE` row-locking to prevent overselling
- Automatic total calculation
- Cancel order → restores stock for confirmed orders
- Order statuses: `pending`, `confirmed`, `cancelled`

### Dashboard
- KPIs: products, customers, orders, revenue, low-stock count
- Charts (Recharts): Revenue per month, Orders per month, Top selling products, Inventory distribution (pie)
- Recent orders + Low stock alerts

### Security
- JWT access tokens (`HS256`) with bcrypt password hashing
- All `/api/v1/**` routes (except `/auth/login`) require auth
- Role-based access: only `admin` can delete products / customers, create users

---

## API Surface (`/api/v1`)

### Auth
- `POST /auth/login` — body `{ email, password }` → `{ access_token, user }`
- `GET  /auth/me`
- `POST /auth/users` (admin) — create users

### Products
- `GET  /products?q=&page=&page_size=`
- `GET  /products/{id}`
- `POST /products`
- `PUT  /products/{id}`
- `DELETE /products/{id}` (admin)

### Customers
- `GET  /customers?q=&page=&page_size=`
- `GET  /customers/{id}`
- `POST /customers`
- `PUT  /customers/{id}`
- `DELETE /customers/{id}` (admin)

### Orders
- `GET  /orders?status=&page=&page_size=`
- `GET  /orders/{id}`
- `POST /orders` — body `{ customer_id, items: [{ product_id, quantity }] }`
- `PUT  /orders/{id}/cancel`

### Dashboard
- `GET  /dashboard/summary`

Full schemas + interactive testing at **`/docs`**.

---

## Database Schema

Tables: `users`, `products`, `customers`, `orders`, `order_items`.

- `products.sku` UNIQUE, `CHECK price >= 0`, `CHECK stock_quantity >= 0`
- `customers.email` UNIQUE
- `orders.customer_id` → `customers.id` (`ON DELETE RESTRICT`)
- `order_items.order_id` → `orders.id` (`ON DELETE CASCADE`)
- `order_items.product_id` → `products.id` (`ON DELETE RESTRICT`)
- Indexes on FKs, `orders.status`, `orders.order_date`, `products.name`, `customers.email`
- `CHECK quantity > 0`, `CHECK unit_price >= 0` on `order_items`

Schema is created automatically by SQLAlchemy at startup. For production, generate Alembic migrations from the same models.

---

## Deployment

### Backend → Render / Railway

1. Push the repo to GitHub.
2. Create a **Web Service** pointing at the `backend/` directory.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment variables:
   - `DATABASE_URL` — Supabase / Render Postgres connection string (use `postgresql+psycopg2://…`)
   - `JWT_SECRET` — strong random secret
   - `CORS_ORIGINS` — your frontend URL, e.g. `https://your-app.vercel.app`
   - `SEED_DEMO_DATA=false` for production

### Database → Supabase

1. Create a Supabase project; copy the **connection string** (Direct or Pooled).
2. Prefix the scheme with `postgresql+psycopg2://` for SQLAlchemy.
3. The first backend boot creates all tables.

### Frontend → Vercel

1. Import the repo into Vercel; set **Root Directory** to `frontend`.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
3. Environment variable: `VITE_API_URL=https://your-backend.onrender.com/api/v1`
4. Deploy.

---

## Code Quality

- TypeScript `strict: true` on the frontend
- Backend follows Clean Architecture: API → Service → Repository → Model
- Atomic, transactional order creation with stock locking
- Pydantic v2 schemas with field-level validation (bounds, lengths, email format)
- Role-based dependencies on every protected route
- No mock data — backend is fully functional out of the box
