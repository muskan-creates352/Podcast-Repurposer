# AI Podcast Repurposer - Backend

Backend service for **AI Podcast Repurposer** built with **FastAPI**, **SQLAlchemy** (PostgreSQL / SQLite fallback), **JWT Authentication**, and **Pydantic v2**.

---

## 📁 Folder Structure Explained (For College Viva)

```text
backend/
├── app/
│   ├── core/
│   │   ├── config.py           # Application settings, CORS, JWT secrets loaded from .env
│   │   ├── database.py         # SQLAlchemy engine, SessionLocal, and get_db dependency
│   │   └── security.py         # Password hashing using bcrypt and JWT token generation
│   ├── models/                 # Database table definitions (SQLAlchemy ORM)
│   │   ├── user.py             # User accounts with hashed passwords
│   │   ├── project.py          # Creator projects/shows
│   │   ├── episode.py          # Episodes with status and progress matching contract
│   │   ├── transcript.py       # Timestamped transcripts with speaker labels
│   │   ├── clip.py             # Video/Audio clips (start_time, end_time, reason, score)
│   │   ├── content.py          # Generated content (blog, social, show_notes)
│   │   ├── review.py           # Human approval and editing audit trail
│   │   └── audit.py            # System activity audit logs
│   ├── schemas/                # Pydantic v2 validation models matching exact API contract
│   │   ├── auth.py             # Register, Login, Token, and User profile schemas
│   │   ├── episode.py          # Episode contract: { id, title, status, duration, created_at, progress }
│   │   ├── clip.py             # Clip contract: { id, episode_id, start_time, end_time, text, reason, status }
│   │   ├── content.py          # GeneratedContent contract: { id, episode_id, type, body, source_timestamps, status }
│   │   ├── transcript.py       # Segments with speaker labels and timestamps
│   │   └── dashboard.py        # Stats: { total_episodes, clips_generated, pending_reviews, avg_processing_time }
│   ├── services/               # Reusable business logic
│   │   ├── auth_service.py     # User registration, password verification, and JWT decode
│   │   ├── episode_service.py  # File upload handling, disk persistence, episode fetching
│   │   └── dashboard_service.py# Dashboard statistics aggregation and weekly trends
│   ├── routers/                # REST API route handlers
│   │   ├── auth.py             # /api/auth (register, login, me)
│   │   ├── episodes.py         # /api/episodes (upload, list, details, transcript)
│   │   └── dashboard.py        # /api/dashboard (stats, weekly)
│   └── main.py                 # FastAPI application entry point, CORS config, lifespan
├── uploads/                    # Local directory storing uploaded media files
├── scripts/
│   └── seed_data.py            # Database seeder (5 realistic episodes, clips, transcripts, content)
├── tests/
│   ├── conftest.py             # Pytest configuration and isolated SQLite test DB fixture
│   └── test_phase1.py          # Automated tests for Auth, Episodes, Dashboard, and Contracts
├── .env.example                # Environment variable template
├── .env                        # Local configuration
└── requirements.txt            # Python dependencies
```

---

## 🎯 Exact API Contract Followed

All routes are mounted under the base path: `http://localhost:8000/api`

| Entity | Contract Fields | Notes |
| :--- | :--- | :--- |
| **Episode** | `{ id, title, status, duration, created_at, progress }` | Status: `uploaded` \| `transcribing` \| `processing` \| `ready_for_review` \| `published` |
| **Clip** | `{ id, episode_id, start_time, end_time, text, reason, status }` | Status: `pending` \| `approved` \| `rejected` |
| **GeneratedContent** | `{ id, episode_id, type, body, source_timestamps, status }` | Type: `blog` \| `social` \| `show_notes` |
| **Stats** | `{ total_episodes, clips_generated, pending_reviews, avg_processing_time }` | Aggregated dashboard metrics |

CORS is explicitly enabled for `http://localhost:3000` to support the Next.js frontend.

---

## 🚀 How to Run Locally

### 1. Set Up Virtual Environment & Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment (.env)
```bash
cp .env.example .env
```
*By default, `DATABASE_URL` is configured to `sqlite:///./podcast.db` for instant local execution without installing PostgreSQL. To switch to PostgreSQL, set `DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/podcast_db`.*

### 3. Seed Sample Data (5 Episodes + Clips + Content)
```bash
python scripts/seed_data.py
```

### 4. Run the Server
```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- ReDoc API Docs: `http://localhost:8000/redoc`

### 5. Run Automated Tests
```bash
pytest tests/ -v
```

---

## 🧪 Ready-to-Use Curl Commands for Testing

### Health Check
```bash
curl -s http://localhost:8000/api/health
```

### 1. User Registration
```bash
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viva_examiner@college.edu",
    "password": "SecurePassword123!",
    "full_name": "Viva Examiner"
  }'
```

### 2. User Login (Obtain JWT Token)
```bash
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@podcastrepurposer.io",
    "password": "Password123!"
  }'
```

### 3. Protected Route (GET /auth/me)
```bash
# Save token in variable
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@podcastrepurposer.io", "password":"Password123!"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -s -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Dashboard Metrics
```bash
# Overview stats
curl -s http://localhost:8000/api/dashboard/stats

# Episodes per week
curl -s http://localhost:8000/api/dashboard/weekly
```

### 5. List Episodes
```bash
curl -s http://localhost:8000/api/episodes
```

### 6. Get Single Episode Metadata
```bash
curl -s http://localhost:8000/api/episodes/1
```

### 7. Get Episode Transcript with Timestamps & Speakers
```bash
curl -s http://localhost:8000/api/episodes/1/transcript
```

### 8. Upload a New Episode
```bash
curl -s -X POST http://localhost:8000/api/episodes \
  -F "file=@sample.mp3" \
  -F "title=My Demo Podcast Episode"
```

---

## 🎓 College Viva Explanation Points

1. **Why FastAPI?**
   - Built on Starlette (ASGI) and Pydantic (data validation), FastAPI provides asynchronous request handling, automatic OpenAPI/Swagger documentation, and compile-time type validation with high throughput.

2. **Why Layered Architecture (Routers -> Services -> Models)?**
   - **Separation of Concerns:** Routers only deal with HTTP parsing and status codes. Services contain reusable business rules. Models represent database persistence. This prevents fat controllers and simplifies unit testing.

3. **How does JWT Authentication work?**
   - **Stateless:** The server doesn't store session states in RAM. Instead, it signs a JSON payload containing the user ID and expiration timestamp with a symmetric secret key (`HS256`).
   - **Secure Password Storage:** Passwords are never stored in plaintext. They are salted and hashed with `bcrypt`, an adaptive hashing function resistant to brute-force attacks.

4. **Why SQLite Fallback along with PostgreSQL?**
   - SQLAlchemy acts as an Object-Relational Mapper (ORM), abstracting SQL dialects. During live college viva demonstrations or offline setups, the system can use SQLite zero-config, while seamlessly connecting to PostgreSQL in production environments with `DATABASE_URL`.
