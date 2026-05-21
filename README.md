# Primetrade API

A production-grade REST API with JWT authentication, role-based access control, and task management — built as a backend developer intern assignment.

**Live Demo:** https://primetrade-backend-x9il.vercel.app
**API Docs (Swagger):** https://primetrade-backend-production.up.railway.app/api/docs

> Demo credentials: `admin@primetrade.ai / Admin123` · `demo@primetrade.ai / User1234`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20 + TypeScript (strict) |
| Framework | Express.js v5 |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (httpOnly cookies) + refresh token rotation |
| Validation | Zod (body + params + query) |
| Logging | pino + pino-http (structured JSON, request IDs) |
| Docs | Swagger UI (OpenAPI 3.0) |
| Testing | Vitest + Supertest (13 tests) |
| CI | GitHub Actions (typecheck + build) |
| Containerization | Docker + Docker Compose |
| Frontend | React + Vite + Tailwind CSS |
| Deployment | Railway (API) + Vercel (frontend) + Neon (PostgreSQL) |

---

## Architecture

```mermaid
graph TD
    A[React Frontend<br/>Vercel] -->|HTTPS + Bearer token| B[Express API<br/>Railway]
    B --> C[PostgreSQL<br/>Neon]
    B --> D[Swagger UI<br/>/api/docs]

    subgraph Auth Flow
        E[POST /auth/login] -->|set httpOnly cookies| F[Access Token 15m]
        E --> G[Refresh Token 7d]
        G -->|POST /auth/refresh| F
    end
API Endpoints
Auth
Method	Endpoint	Auth	Description
POST	/api/v1/auth/register	—	Register, returns JWT
POST	/api/v1/auth/login	—	Login, sets httpOnly cookies
POST	/api/v1/auth/refresh	—	Rotate refresh token
POST	/api/v1/auth/logout	—	Clear tokens
GET	/api/v1/auth/me	✓	Current user profile
Tasks
Method	Endpoint	Auth	Description
POST	/api/v1/tasks	✓	Create task
GET	/api/v1/tasks	✓	List (paginated, filtered, sorted)
GET	/api/v1/tasks/:id	✓	Get single task
PATCH	/api/v1/tasks/:id	✓	Update task
DELETE	/api/v1/tasks/:id	✓	Delete task
Users (Admin only)
Method	Endpoint	Auth	Description
GET	/api/v1/users	Admin	List all users
GET	/api/v1/users/:id	Admin	Get user
PATCH	/api/v1/users/:id/role	Admin	Change role
DELETE	/api/v1/users/:id	Admin	Soft delete
Local Setup
Prerequisites
Node.js 20+
Docker
1. Clone and install

git clone https://github.com/AshrafAhmed9/primetrade-backend.git
cd primetrade-backend
npm install
2. Start the database

docker run --name primetrade-postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=primetrade_db \
  -p 5433:5432 -d postgres:16
3. Configure environment

cp .env.example .env
# Edit .env — DATABASE_URL is pre-configured for the Docker container above
4. Run migrations and seed

npx prisma migrate dev
npm run seed
5. Start the server

npm run dev
# API: http://localhost:3000
# Swagger: http://localhost:3000/api/docs
Or run everything with Docker Compose

docker-compose up
Run tests

npm test
Start frontend

cd frontend && npm install && npm run dev
# http://localhost:5173
Environment Variables
Variable	Description
DATABASE_URL	PostgreSQL connection string
JWT_ACCESS_SECRET	Secret for access tokens (min 16 chars)
JWT_REFRESH_SECRET	Secret for refresh tokens (min 16 chars)
FRONTEND_URL	Allowed CORS origin
PORT	Server port (default: 3000)
NODE_ENV	development / production
Security Practices
Passwords — bcryptjs with 12 salt rounds, never stored plain
JWT — short-lived access tokens (15m) stored in httpOnly cookies (XSS-resistant)
Refresh token rotation — every refresh issues a new token and invalidates the old one; tokens stored in DB for revocation
Rate limiting — auth routes: 10 req/15min; task routes: 100 req/15min
Input validation — Zod validates body, params, and query params; unknown fields stripped
Helmet — secure HTTP headers on all responses
Soft delete — users never hard-deleted; data integrity preserved
Scalability Notes
Stateless auth — JWT means any number of API instances can run behind a load balancer without sticky sessions
Database indexes — userId, status, createdAt indexed on tasks; email, role indexed on users
Pagination — all list endpoints paginated; no unbounded queries
Modular architecture — each domain (auth, users, tasks) is fully isolated; adding a new entity takes ~30 minutes
Docker-ready — multi-stage Dockerfile produces a lean production image
Future scaling — Redis for refresh token revocation + response caching; read replicas for PostgreSQL; Kubernetes for orchestration; message queues for async workflows
Project Structure

src/
├── config/          # Env validation, Swagger, Prisma client
├── controllers/     # Thin HTTP handlers
├── middleware/      # Auth, role, validation, error handling
├── routes/v1/       # API versioned routes
├── services/        # Business logic
├── schemas/         # Zod validation schemas
├── utils/           # JWT, bcrypt, response helpers, AppError
└── types/           # Express type extensions
Engineering Decisions
Why httpOnly cookies over localStorage for JWT?
Cookies with httpOnly flag are inaccessible to JavaScript, making them immune to XSS attacks. localStorage tokens can be stolen by any injected script.

Why refresh token rotation?
Each refresh token is single-use. If a token is stolen and used, the legitimate user's next refresh invalidates the stolen token — limiting the attack window.

Why Prisma over raw SQL?
Type-safe queries, auto-generated migrations, and a clean schema definition in one file. Prevents SQL injection by design.

Why Zod for validation?
Runtime type safety that mirrors TypeScript types. Validates body, params, and query at the boundary — before any business logic runs. Unknown fields are stripped automatically.

Why layered architecture (controllers → services)?
Controllers handle only HTTP concerns (status codes, cookies, request parsing). Services contain business logic and are testable without HTTP context.

Why pino over morgan?
pino produces structured JSON logs with automatic request IDs — directly parseable by log aggregators (Datadog, CloudWatch). morgan produces human-readable strings.



---
