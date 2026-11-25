import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Ensures all model tables are registered with Base.metadata
from app.routers import (
    auth_router,
    episodes_router,
    dashboard_router,
    insights_router,
    clips_router,
    social_video_router,
    notifications_router,
    analytics_router,
    reviews_router,
    audit_router,
    search_router,
    youtube_router,
    groq_router,
    tts_router,
)
from app.services.episode_service import ensure_upload_dir


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Runs on startup to initialize DB tables and required directories.
    """
    # Create DB tables
    Base.metadata.create_all(bind=engine)

    # Lightweight migration: ensure low_confidence column exists in transcripts table
    try:
        with engine.connect() as conn:
            if engine.dialect.name == "sqlite":
                res = conn.execute(text("PRAGMA table_info(transcripts)")).fetchall()
                col_names = [row[1] for row in res]
                if col_names and "low_confidence" not in col_names:
                    conn.execute(text("ALTER TABLE transcripts ADD COLUMN low_confidence BOOLEAN DEFAULT 0"))
                    conn.commit()
    except Exception:
        pass

    # Ensure uploads directory is ready
    ensure_upload_dir()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for AI Podcast Repurposer - Transcribe, extract clips, and generate multi-format content.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware: Localhost + Deployed Vercel Frontend
cors_origins = settings.BACKEND_CORS_ORIGINS if isinstance(settings.BACKEND_CORS_ORIGINS, list) else [settings.BACKEND_CORS_ORIGINS]
allow_all = "*" in cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else cors_origins,
    allow_origin_regex=None if allow_all else r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True if not allow_all else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api prefix
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(episodes_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(insights_router, prefix=settings.API_PREFIX)
app.include_router(clips_router, prefix=settings.API_PREFIX)
app.include_router(social_video_router, prefix=settings.API_PREFIX)
app.include_router(notifications_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(reviews_router, prefix=settings.API_PREFIX)
app.include_router(audit_router, prefix=settings.API_PREFIX)
app.include_router(search_router, prefix=settings.API_PREFIX)
app.include_router(youtube_router, prefix=settings.API_PREFIX)
app.include_router(groq_router, prefix=settings.API_PREFIX)
app.include_router(tts_router, prefix=settings.API_PREFIX)

# Support direct routes and legacy aliases seamlessly
from app.routers.dashboard import read_stats, read_weekly, read_agents_status
from app.routers.episodes import list_episodes, get_episode, get_episode_clips, get_episode_content

app.add_api_route("/api/analytics/weekly", read_weekly, methods=["GET"], tags=["Analytics Alias"])
app.add_api_route("/api/agents/status", read_agents_status, methods=["GET"], tags=["Agents Alias"])
app.add_api_route("/api/v1/analytics/overview", read_stats, methods=["GET"], tags=["Analytics V1 Alias"])
app.add_api_route("/api/v1/analytics/weekly", read_weekly, methods=["GET"], tags=["Analytics V1 Alias"])
app.add_api_route("/api/v1/agents/status", read_agents_status, methods=["GET"], tags=["Agents V1 Alias"])
app.add_api_route("/api/v1/podcasts", list_episodes, methods=["GET"], tags=["Podcasts V1 Alias"])
app.add_api_route("/api/v1/podcasts/{id}", get_episode, methods=["GET"], tags=["Podcasts V1 Alias"])
app.add_api_route("/api/v1/podcasts/{id}/clips", get_episode_clips, methods=["GET"], tags=["Podcasts V1 Alias"])
app.add_api_route("/api/v1/podcasts/{id}/content", get_episode_content, methods=["GET"], tags=["Podcasts V1 Alias"])


@app.get("/")
def root():
    return {
        "message": "Welcome to AI Podcast Repurposer API",
        "docs": "/docs",
        "api_base": f"{settings.API_PREFIX}",
    }


@app.get(f"{settings.API_PREFIX}/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
    }
