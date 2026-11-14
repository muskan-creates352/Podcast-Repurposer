from typing import List
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.episode import Episode
from app.models.audit import AuditLog
from app.schemas.notifications import NotificationItem


def get_notifications(db: Session, limit: int = 50) -> List[NotificationItem]:
    """
    Derives real-time notifications from Episode status states and AuditLog events.
    Returns notifications ordered chronologically with the newest first.
    """
    notifications: List[NotificationItem] = []
    episodes = db.query(Episode).order_by(Episode.created_at.desc()).limit(limit).all()

    for ep in episodes:
        ep_time = ep.created_at
        if ep_time.tzinfo is None:
            ep_time = ep_time.replace(tzinfo=timezone.utc)

        # Status-derived notifications
        if ep.status == "ready_for_review":
            notifications.append(
                NotificationItem(
                    id=f"notif_ep_{ep.id}_ready",
                    episode_id=ep.id,
                    episode_title=ep.title,
                    title="Ready for Review",
                    message=f"'{ep.title}' has finished processing. Highlights and multi-format content are ready for editorial review.",
                    type="success",
                    created_at=ep_time,
                    read=False,
                )
            )
        elif ep.status == "processing":
            notifications.append(
                NotificationItem(
                    id=f"notif_ep_{ep.id}_processing",
                    episode_id=ep.id,
                    episode_title=ep.title,
                    title="AI Processing Underway",
                    message=f"Highlight, Content, and Explanation agents are running in parallel on '{ep.title}'.",
                    type="info",
                    created_at=ep_time,
                    read=False,
                )
            )
        elif ep.status == "transcribing":
            notifications.append(
                NotificationItem(
                    id=f"notif_ep_{ep.id}_transcribing",
                    episode_id=ep.id,
                    episode_title=ep.title,
                    title="Transcription In Progress",
                    message=f"Extracting timestamped audio diarization for '{ep.title}'.",
                    type="info",
                    created_at=ep_time,
                    read=False,
                )
            )
        elif ep.status == "uploaded":
            notifications.append(
                NotificationItem(
                    id=f"notif_ep_{ep.id}_uploaded",
                    episode_id=ep.id,
                    episode_title=ep.title,
                    title="New Episode Uploaded",
                    message=f"'{ep.title}' was successfully uploaded and is queued for transcription.",
                    type="info",
                    created_at=ep_time,
                    read=False,
                )
            )

    # Sort notifications with newest first
    notifications.sort(key=lambda x: x.created_at, reverse=True)
    return notifications[:limit]
