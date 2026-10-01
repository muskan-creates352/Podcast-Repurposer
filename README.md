# AI Podcast Repurposer

An end-to-end web platform to convert long-form podcast recordings into multiple distribution-ready formats (short video scripts, blog posts, social threads, newsletters) with source timestamps and RAG-based search across past episodes.

**Track:** GenAI (Creator Economy)  
**Team:** Muskan Kumari, Shivani Patel  
**Mentor:** Hamdaan Sir  
**Project Duration:** 12 Weeks (Phased OJT)  

---

## What is this project?

Podcasters and media teams record hours of audio and video every week. Once an episode goes live, most of that recording sits in storage and never gets used again.

Turning an episode into clips, blog articles, and social posts is still largely done by hand:
- Editors spend hours listening through full recordings just to find 2–3 good moments.
- Output quality varies depending on who is summarizing it.
- AI tools often generate summaries without citing where in the audio the idea actually came from.
- There is no easy way to semantically search through a creator's archive of past episodes.

Existing tools like Opus Clip (video clipping only), Descript (manual editing focus), and Repurpose.io (distribution only) don't solve this end-to-end.

**AI Podcast Repurposer** provides a single pipeline that takes raw audio/video, transcribes it, extracts highlights, and uses parallel GenAI agents to produce multiple content formats — while keeping the creator in the loop to review and edit everything before publishing.

---

## Core Features

- **Audio/Video Ingestion & Transcription:** Upload recordings and get timestamped transcripts with speaker segmentation.
- **Multi-Format Generation:** Generate multiple ready-to-use formats from one transcript:
  - Summaries and key takeaways
  - Social media posts (Twitter/X threads, LinkedIn posts)
  - SEO blog drafts
  - Email newsletters
  - Short-form vertical video scripts (Hooks + Scene descriptions + CTAs)
- **Highlight Extraction with Explanations:** The system identifies key moments and provides a short explanation with timestamp citations so reviewers can verify why a clip was recommended.
- **Back-Catalog Search (RAG):** Search across all past uploaded episodes by topic, guest, or quote using vector retrieval.
- **Creator Review Studio:** Full UI to preview, edit, regenerate, and copy/export generated content.
- **Job-based Async Processing:** Long-running transcription and generation tasks run in the background with live progress tracking.

---

## System Architecture

The project is structured in layers: a Next.js frontend, a FastAPI backend, PostgreSQL for persistence, and a stateful LangGraph pipeline for the AI orchestration.

```
+----------------------------------------------------------------+
|                        Next.js Frontend                        |
|   Dashboard  |  Podcast Library  |  Content Studio  | Analytics|
+-------------------------------+--------------------------------+
                                | REST API / JWT
                                v
+----------------------------------------------------------------+
|                        FastAPI Backend                         |
|   Auth Routes  |  Podcast CRUD  |  Job Tracker  |  Validation  |
+---------------+-------------------------------+----------------+
                |                               |
                v                               v
+-------------------------------+   +----------------------------+
|     PostgreSQL Database       |   |      LangGraph Pipeline    |
| Users, Podcasts, Transcripts, |   | - ASR Transcription        |
| Content, Jobs, Analytics      |   | - Highlight Detection      |
+-------------------------------+   | - Parallel Content Gen     |
                                    | - Timestamp Grounding      |
                                    | - RAG Vector Retrieval     |
                                    | - Output Schema Validator  |
                                    +----------------------------+
```

### AI Processing Flow (LangGraph)

```
START
  │
  ▼
[Load Podcast & Audio Reference]
  │
  ▼
[Transcribe Audio & Extract Timestamps]
  │
  ▼
[Clean & Normalize Transcript]
  │
  ├────────────────────────┬────────────────────────┐
  ▼                        ▼                        ▼
[Highlight Agent]    [Content Agent]         [RAG Archive Search]
  │                        │                        │
  ▼                        │                        │
[Explanation Agent]        │                        │
  │                        │                        │
  └────────────────────────┼────────────────────────┘
                           │
                           ▼
               [Validate Output Schema]
                           │
                   ┌───────┴───────┐
                   │ Valid?        │
               Yes │               │ No (Retry <= 2)
                   ▼               ▼
           [Save to DB]     [Repair / Retry]
                   │
                   ▼
       [Human Review in Studio]
                   │
                   ▼
                  END
```

---

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, TanStack React Query
- **Backend:** FastAPI (Python 3.11+), Pydantic v2
- **Database & Storage:** PostgreSQL, SQLAlchemy, Object Storage for audio/video assets
- **AI & Orchestration:** LangGraph, LangChain, LLM APIs, Speech-to-Text (ASR)
- **Vector Search:** pgvector / ChromaDB for episode archive retrieval
- **Auth & Security:** JWT-based authentication with hashed passwords
- **Containerization:** Docker & Docker Compose

---

## Project Structure

```text
Podcast-Repurposer/
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── layout/          # Header, Sidebar
│   │   │   ├── pages/           # Dashboard, Podcasts, ContentStudio, Analytics
│   │   │   ├── modals/          # Upload & Edit dialogs
│   │   │   └── ui/              # Reusable UI components
│   │   ├── hooks/               # React Query hooks & client store
│   │   ├── types/               # TypeScript interfaces
│   │   └── data/                # Mock data (Phase-1 frontend)
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/                 # Auth, Podcasts, Content, Jobs endpoints
│   │   ├── ai/                  # LangGraph workflow, nodes, prompts, providers
│   │   ├── models/              # SQLAlchemy database tables
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # Business logic
│   │   ├── db/                  # Session and DB setup
│   │   └── main.py              # FastAPI app entry point
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
```

---

## API Overview

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and receive JWT access token |
| `GET` | `/api/v1/podcasts` | List all podcasts for current user |
| `POST` | `/api/v1/podcasts` | Create a new podcast entry / upload reference |
| `GET` | `/api/v1/podcasts/{id}` | Get podcast details and transcript |
| `POST` | `/api/v1/podcasts/{id}/transcribe` | Trigger transcription job |
| `POST` | `/api/v1/podcasts/{id}/generate` | Trigger content generation job |
| `GET` | `/api/v1/jobs/{id}` | Check job status (`pending`, `processing`, `completed`, `failed`) |
| `GET` | `/api/v1/podcasts/{id}/content` | Get all generated content for an episode |
| `PATCH`| `/api/v1/content/{id}` | Save user edits to generated content |
| `GET` | `/api/v1/analytics/overview` | Fetch usage metrics and generation counts |

---

## 12-Week Implementation Plan

This project is being executed over a 3-month timeline across three evaluation phases:

- **Weeks 1–4 (Phase 1 - Frontend & UI MVP):**
  - Next.js application scaffold, Tailwind styling, and responsive navigation.
  - Dashboard, Podcast Library, Content Studio, and Analytics pages.
  - Local state management and mock data flow.
  - *Outcome:* Working Frontend MVP for Viva 1.

- **Weeks 5–8 (Phase 2 - Backend & Persistence):**
  - FastAPI server setup, PostgreSQL schema design, and SQLAlchemy models.
  - JWT signup/login flow and route protection.
  - Core CRUD APIs for podcasts, transcripts, and job tracking.
  - Frontend integration with React Query.
  - *Outcome:* Persistent Full-Stack Application for Viva 2.

- **Weeks 9–12 (Phase 3 - AI Workflow & Polish):**
  - LangGraph stateful graph implementation.
  - ASR integration and parallel content generation agents.
  - RAG vector search over past episode transcripts.
  - Structured output validation and bounded retry handling.
  - Docker containerization and final documentation.
  - *Outcome:* Complete Repurposing System for Viva 3.

---

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/muskan-creates352/Podcast-Repurposer.git
cd Podcast-Repurposer
```

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run the Backend
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API documentation will be available at `http://localhost:8000/docs`.

---

## Validation & Guardrails

- **Structured Output Parsing:** Every LLM response is validated against strict Pydantic schemas before being saved or shown to the user.
- **Bounded Retry Loops:** If the model returns incomplete or invalid JSON, the repair node retries up to 2 times before failing safely.
- **Hallucination Control:** Prompts require direct citation of transcript chunks with timestamps.
- **Async Job Processing:** Transcription and generation are handled asynchronously so the API does not time out on long episodes.

---

## Team

- **Muskan Kumari** — Frontend & Backend Development, LangGraph Pipeline, Documentation
- **Shivani Patel** — Frontend & Backend Development, RAG Retrieval, Testing & Evaluation
- **Mentor:** **Hamdaan Sir**