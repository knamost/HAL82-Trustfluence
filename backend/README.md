# Trustfluence — Creator × Brand Marketplace MVP

A simple monolithic platform that connects **creators** and **brands** for influencer marketing collaborations.

---

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Runtime        | Node.js (ES Modules)                |
| Framework      | Express v5                          |
| Database       | PostgreSQL 16                       |
| ORM            | Drizzle ORM                         |
| Auth           | JWT + Argon2 password hashing       |
| Containerisation | Docker Compose                    |
| Package Manager | pnpm                              |

---

## Database Schema

```
users
├── id (uuid, PK)
├── email (unique)
├── password (argon2 hash)
├── role (enum: creator | brand)
├── created_at
└── updated_at

creator_profiles
├── id (uuid, PK)
├── user_id (FK → users, unique)
├── display_name, bio, avatar_url
├── platform, social_handle
├── followers_count, engagement_rate
├── niches (jsonb[])
├── promotion_types (jsonb[])
├── created_at, updated_at

brand_profiles
├── id (uuid, PK)
├── user_id (FK → users, unique)
├── company_name, bio, logo_url, website
├── category
├── created_at, updated_at

requirements  (brand job posts)
├── id (uuid, PK)
├── brand_id (FK → users)
├── title, description
├── niches (jsonb[]), min_followers, min_engagement_rate
├── budget_min, budget_max
├── status (enum: open | closed | paused)
├── created_at, updated_at

ratings  (unique per from→to pair)
├── id, from_user_id, to_user_id, score (1-5)
└── created_at

reviews
├── id, from_user_id, to_user_id, content
└── created_at
```

---

## API Routes

### Auth
| Method | Endpoint          | Auth | Description              |
| ------ | ----------------- | ---- | ------------------------ |
| POST   | `/auth/register`  | —    | Register (creator/brand) |
| POST   | `/auth/login`     | —    | Login, returns JWT       |
| GET    | `/auth/me`        | ✓    | Get current user info    |

### Creators
| Method | Endpoint             | Auth        | Description                                         |
| ------ | -------------------- | ----------- | --------------------------------------------------- |
| GET    | `/creators`          | —           | List creators (filters: `niche`, `minFollowers`, `minEngagement`, `search`) |
| GET    | `/creators/profile`  | ✓ creator   | Get own profile                                     |
| PUT    | `/creators/profile`  | ✓ creator   | Create / update own profile                         |
| GET    | `/creators/:id`      | —           | View creator by profile id (includes avg rating)    |

### Brands
| Method | Endpoint           | Auth      | Description                                         |
| ------ | ------------------ | --------- | --------------------------------------------------- |
| GET    | `/brands`          | —         | List brands (filters: `category`, `minRating`, `search`) |
| GET    | `/brands/profile`  | ✓ brand   | Get own profile                                     |
| PUT    | `/brands/profile`  | ✓ brand   | Create / update own profile                         |
| GET    | `/brands/:id`      | —         | View brand by profile id (includes avg rating)      |

### Requirements (Brand Job Posts)
| Method | Endpoint              | Auth      | Description                                     |
| ------ | --------------------- | --------- | ----------------------------------------------- |
| GET    | `/requirements`       | —         | List requirements (filters: `niche`, `minFollowers`, `status`) |
| POST   | `/requirements`       | ✓ brand   | Post a new requirement                          |
| GET    | `/requirements/:id`   | —         | Get single requirement                          |
| PUT    | `/requirements/:id`   | ✓ brand   | Update own requirement                          |
| DELETE | `/requirements/:id`   | ✓ brand   | Delete own requirement                          |

### Feedback (Ratings & Reviews)
| Method | Endpoint                      | Auth | Description                          |
| ------ | ----------------------------- | ---- | ------------------------------------ |
| POST   | `/feedback/ratings`           | ✓    | Rate a user (upsert, 1-5)           |
| GET    | `/feedback/ratings/:userId`   | —    | Get ratings & average for a user     |
| POST   | `/feedback/reviews`           | ✓    | Leave a text review                  |
| GET    | `/feedback/reviews/:userId`   | —    | Get all reviews for a user           |

### Social Metrics (Mock)
| Method | Endpoint                        | Auth | Description                              |
| ------ | ------------------------------- | ---- | ---------------------------------------- |
| GET    | `/social/:platform/:handle`     | —    | Fetch mock follower/engagement metrics   |

Supported platforms: `instagram`, `tiktok`, `youtube`, `twitter`

---

## Getting Started

```bash
# 1. Clone & install
pnpm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Push schema to database
npx drizzle-kit push

# 4. Start dev server (with --watch)
pnpm dev
```

The API will be available at `http://localhost:8000`.

---

## Environment Variables

Copy `.env.example` → `.env` and configure:

```
DATABASE_URL=postgres://postgres:admin@localhost:5432/postgres
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
PORT=8000
NODE_ENV=development
```

---

## Deployment Strategy (Simple)

1. **Single VPS** (DigitalOcean / Hetzner / Railway) — perfectly adequate for small-medium scale.
2. `docker compose up -d` runs both Postgres and the app (add an app service to docker-compose for production).
3. Place **Caddy** or **nginx** as a reverse proxy in front for TLS termination.
4. Use `NODE_ENV=production` and a strong `JWT_SECRET`.
5. Back up the Postgres `db_data` volume regularly.

---

## Project Structure

```
src/
├── index.js              # Express app entry point
├── db/index.js           # Drizzle DB connection
├── models/index.js       # Drizzle schema (all tables & enums)
├── middlewares/
│   ├── auth.js           # JWT authenticate + role authorize
│   └── errorHandler.js   # Central error handler
├── routes/
│   ├── auth.js           # /auth/*
│   ├── creators.js       # /creators/*
│   ├── brands.js         # /brands/*
│   ├── requirements.js   # /requirements/*
│   ├── feedback.js       # /feedback/ratings/* & /feedback/reviews/*
│   └── social.js         # /social/:platform/:handle
├── services/
│   ├── authService.js    # Register, login, getMe
│   ├── creatorService.js # Creator CRUD + filtering
│   ├── brandService.js   # Brand CRUD + filtering
│   ├── requirementService.js # Requirement CRUD + filtering
│   ├── ratingService.js  # Ratings & reviews logic
│   └── socialService.js  # Mock social metrics fetcher
├── validation/index.js   # Request validation helpers
└── utils/
    ├── jwt.js            # Sign & verify JWT tokens
    ├── asyncHandler.js   # Async route wrapper
    └── AppError.js       # Custom error class
```

---

## Future Improvement Ideas

1. **Real social-media API integration** — Replace the mock `socialService` with Instagram Graph API, TikTok API, YouTube Data API v3.
2. **Messaging / Chat** — Let creators and brands communicate in-app (WebSocket-based).
3. **Payment integration** — Stripe Connect for escrow-based payments between brands and creators.
4. **Email notifications** — Transactional emails for new requirements matching creator niches.
5. **Admin dashboard** — Moderation panel for flagged reviews, user management.
