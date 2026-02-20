# Trustfluence

An influencer-marketing marketplace that connects **creators** and **brands**. Creators build verified profiles, brands post campaign requirements, and both sides can rate and review each other for trust and transparency.

---

## Tech Stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Frontend  | React 18, Vite, React Router 7, Tailwind CSS 4        |
| Backend   | Node.js, Express 5, Drizzle ORM, PostgreSQL 16        |
| Auth      | JWT (HS256) + Argon2 password hashing                  |
| Infra     | Docker Compose (Postgres), pnpm workspaces             |

---

## Project Structure

```
├── backend/            # Express REST API
│   └── src/
│       ├── controllers/
│       ├── db/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── validation/
├── frontend/           # React SPA
│   └── src/
│       ├── app/
│       │   ├── components/   # Pages & UI components
│       │   └── context/      # Auth context provider
│       ├── lib/              # API service layer
│       └── styles/
```

---

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** (`npm i -g pnpm`)
- **Docker & Docker Compose** (for PostgreSQL)

---

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url> && cd HAL82-Trustfluence
```

### 2. Backend

```bash
cd backend
pnpm install

# Start PostgreSQL
docker compose up -d

# Push the Drizzle schema to the database
npx drizzle-kit push

# Copy & configure environment variables
cp .env.example .env   # then edit as needed

# Start the dev server
pnpm dev
```

The API runs at **http://localhost:8000**.

### 3. Frontend

```bash
cd frontend
pnpm install

# Start the Vite dev server
pnpm dev
```

The app runs at **http://localhost:5173** and proxies API calls to the backend.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Default                                         | Description              |
| -------------- | ----------------------------------------------- | ------------------------ |
| `DATABASE_URL` | `postgres://postgres:admin@localhost:5432/postgres` | Postgres connection URL  |
| `JWT_SECRET`   | `change-me-in-production`                       | JWT signing secret       |
| `JWT_EXPIRES_IN` | `7d`                                          | Token expiry duration    |
| `PORT`         | `8000`                                          | API server port          |

### Frontend (`frontend/.env`)

| Variable        | Default                  | Description       |
| --------------- | ------------------------ | ----------------- |
| `VITE_API_URL`  | `http://localhost:8000`  | Backend base URL  |

---

## API Endpoints

### Auth
| Method | Path              | Auth | Description              |
| ------ | ----------------- | ---- | ------------------------ |
| POST   | `/auth/register`  | —    | Register (creator/brand) |
| POST   | `/auth/login`     | —    | Login → JWT              |
| GET    | `/auth/me`        | ✓    | Current user info        |

### Creators
| Method | Path                | Auth      | Description                  |
| ------ | ------------------- | --------- | ---------------------------- |
| GET    | `/creators`         | —         | List / search creators       |
| GET    | `/creators/profile` | ✓ creator | Own profile                  |
| PUT    | `/creators/profile` | ✓ creator | Upsert own profile           |
| GET    | `/creators/:id`     | —         | View creator by profile ID   |

### Brands
| Method | Path              | Auth    | Description               |
| ------ | ----------------- | ------- | ------------------------- |
| GET    | `/brands`         | —       | List / search brands      |
| GET    | `/brands/profile` | ✓ brand | Own profile               |
| PUT    | `/brands/profile` | ✓ brand | Upsert own profile        |
| GET    | `/brands/:id`     | —       | View brand by profile ID  |

### Requirements
| Method | Path                 | Auth    | Description          |
| ------ | -------------------- | ------- | -------------------- |
| GET    | `/requirements`      | —       | List requirements    |
| POST   | `/requirements`      | ✓ brand | Create requirement   |
| GET    | `/requirements/:id`  | —       | Get one              |
| PUT    | `/requirements/:id`  | ✓ brand | Update own           |
| DELETE | `/requirements/:id`  | ✓ brand | Delete own           |

### Feedback
| Method | Path                          | Auth | Description                |
| ------ | ----------------------------- | ---- | -------------------------- |
| POST   | `/feedback/ratings`           | ✓    | Rate a user (1-5, upsert)  |
| GET    | `/feedback/ratings/:userId`   | —    | Ratings summary for a user |
| POST   | `/feedback/reviews`           | ✓    | Leave a review             |
| GET    | `/feedback/reviews/:userId`   | —    | All reviews for a user     |

### Social Metrics (mock)
| Method | Path                          | Auth | Description           |
| ------ | ----------------------------- | ---- | --------------------- |
| GET    | `/social/:platform/:handle`   | —    | Mock social metrics   |

---

## Frontend ↔ Backend Integration

All frontend API calls go through a typed service layer in `frontend/src/lib/`:

| File                    | Purpose                          |
| ----------------------- | -------------------------------- |
| `api-client.ts`         | Base fetch wrapper + JWT tokens  |
| `auth.service.ts`       | Login, register, getMe, logout   |
| `creators.service.ts`   | Creator CRUD                     |
| `brands.service.ts`     | Brand CRUD                       |
| `requirements.service.ts` | Requirements CRUD              |
| `feedback.service.ts`   | Ratings & reviews                |
| `social.service.ts`     | Social metrics                   |

The `AuthProvider` context (`frontend/src/app/context/auth-context.tsx`) manages JWT token lifecycle, user state, and role-based access across the app.

Components gracefully fall back to mock data when the backend is unreachable, allowing offline UI development.

---

## Scripts

### Backend
```bash
pnpm dev          # Start with --watch
pnpm db:push      # Push Drizzle schema
pnpm db:studio    # Open Drizzle Studio
```

### Frontend
```bash
pnpm dev          # Vite dev server
pnpm build        # Production build
pnpm preview      # Preview production build
```

---

## License

See [LICENSE](LICENSE) for details.
