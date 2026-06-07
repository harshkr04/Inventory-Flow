# 📦 Inventory Flow

A full-stack **Inventory & Order Management System** built with a modern tech stack. Manage products, customers, orders, and inventory levels — all in one clean, responsive interface.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login with token-based auth
- 📊 **Dashboard** — Real-time KPIs: revenue, orders, low-stock alerts
- 📦 **Product Management** — Full CRUD with category, price, and stock tracking
- 👥 **Customer Management** — Customer profiles with order history
- 🛒 **Order Management** — Create, track, and manage orders end-to-end
- 🏪 **Inventory Control** — Stock level monitoring with low-stock alerts
- 🐳 **Docker Ready** — One-command deployment with Docker Compose
- 📄 **API Docs** — Auto-generated Swagger UI at `/docs`

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| SQLAlchemy 2.0 | ORM |
| PostgreSQL | Primary database |
| Pydantic v2 | Data validation |
| python-jose | JWT authentication |
| passlib + bcrypt | Password hashing |
| Uvicorn | ASGI server |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerisation |
| PostgreSQL 15 | Production database |

---

## 🚀 Quick Start

### Option 1 — Docker Compose (Recommended)

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
# 1. Clone the repo
git clone https://github.com/harshkr04/Inventory-Flow.git
cd Inventory-Flow

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your preferred values

# 3. Start all services (PostgreSQL + Backend + Frontend)
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

### Option 2 — Local Development

#### Prerequisites
- Python 3.11+
- Node.js 18+ (or [Bun](https://bun.sh/))
- PostgreSQL 15

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run the server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install          # or: bun install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000/api

# Start dev server
npm run dev          # or: bun run dev
```

---

## ⚙️ Environment Variables

### Root `.env` (used by Docker Compose)

```env
POSTGRES_USER=ioms
POSTGRES_PASSWORD=ioms_pass
POSTGRES_DB=ioms_db
JWT_SECRET=replace-with-strong-random-secret
```

### `backend/.env`

```env
DATABASE_URL=postgresql+psycopg2://ioms:ioms_pass@localhost:5432/ioms_db
JWT_SECRET=replace-with-strong-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
SEED_DEMO_DATA=true
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:8000/api
```

> **Note:** Never commit `.env` files. They are already listed in `.gitignore`.

---

## 📁 Project Structure

```
Inventory-Flow/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── api/v1/             # Route handlers (auth, products, orders…)
│   │   ├── core/               # Config, database, security
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── repositories/       # Data access layer
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Business logic layer
│   │   ├── seed.py             # Demo data seeder
│   │   └── main.py             # App entry point
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # React + TypeScript application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── lib/                # API client, utilities
│   │   └── App.tsx             # Root component & routing
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Full-stack orchestration
├── .env.example                # Environment variable template
└── README.md
```

---

## 🔌 API Endpoints

The backend auto-generates interactive docs — visit **http://localhost:8000/docs** when running.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate & get JWT token |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create a product |
| GET | `/api/products/{id}` | Get product details |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |
| GET | `/api/customers` | List all customers |
| POST | `/api/customers` | Create a customer |
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Create an order |
| GET | `/api/inventory` | View inventory levels |
| GET | `/api/inventory/low-stock` | Get low-stock items |
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/health` | Health check |

---

## 🌱 Demo Data

When `SEED_DEMO_DATA=true` (default in Docker), the backend auto-seeds the database with sample products, customers, and orders on first start. Use the default credentials from the seeder to log in.

---

## 🐳 Docker Services

| Container | Image | Port |
|---|---|---|
| `ioms_postgres` | postgres:15-alpine | 5432 |
| `ioms_backend` | Custom (FastAPI) | 8000 |
| `ioms_frontend` | Custom (React/Vite) | 5173 |

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/harshkr04">Harsh Kumar Singh</a>
</div>
