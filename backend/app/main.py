import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Ensures all model tables are registered with Base.metadata
from app.routers import auth_router, episodes_router, dashboard_router
from app.services.episode_service import ensure_upload_dir


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Runs on startup to initialize DB tables and required directories.
    """
    # Create DB tables
    Base.metadata.create_all(bind=engine)
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

# CORS Middleware (configured for Next.js frontend at http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api prefix
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(episodes_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)


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
