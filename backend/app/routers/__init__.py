from app.routers.auth import router as auth_router
from app.routers.episodes import router as episodes_router
from app.routers.dashboard import router as dashboard_router
from app.routers.insights import router as insights_router
from app.routers.clips import router as clips_router
from app.routers.social_video import router as social_video_router

__all__ = [
    "auth_router",
    "episodes_router",
    "dashboard_router",
    "insights_router",
    "clips_router",
    "social_video_router",
]
