from app.routers.auth import router as auth_router
from app.routers.episodes import router as episodes_router
from app.routers.dashboard import router as dashboard_router
from app.routers.notifications import router as notifications_router
from app.routers.analytics import router as analytics_router
from app.routers.reviews import router as reviews_router
from app.routers.audit import router as audit_router
from app.routers.search import router as search_router

__all__ = [
    "auth_router",
    "episodes_router",
    "dashboard_router",
    "notifications_router",
    "analytics_router",
    "reviews_router",
    "audit_router",
    "search_router",
]
