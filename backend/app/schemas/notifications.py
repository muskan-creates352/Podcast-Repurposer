from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationItem(BaseModel):
    id: str
    episode_id: int
    episode_title: str
    title: str
    message: str
    type: str  # "info" | "success" | "warning" | "error"
    created_at: datetime
    read: bool = False

    model_config = ConfigDict(from_attributes=True)
