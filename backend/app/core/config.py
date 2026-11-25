import json
import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_DEFAULT_DB_FILE = (_BACKEND_DIR / "podcast.db").as_posix()
_DEFAULT_DB_URL = f"sqlite:///{_DEFAULT_DB_FILE}"


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Podcast Repurposer API"
    API_PREFIX: str = "/api"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS settings: Frontend runs on http://localhost:3000
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        env_allowed = os.getenv("ALLOWED_ORIGINS") or os.getenv("CORS_ORIGINS")
        if env_allowed and (not v or v == ["http://localhost:3000", "http://127.0.0.1:3000"]):
            v = env_allowed
        if isinstance(v, str):
            if v == "*":
                return ["*"]
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            origins = [i.strip() for i in v.split(",") if i.strip()]
            if origins:
                return origins
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Database: Supports PostgreSQL or local SQLite fallback
    DATABASE_URL: str = _DEFAULT_DB_URL

    # JWT Authentication
    SECRET_KEY: str = "college_viva_super_secret_jwt_key_2026_secure_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # File storage for podcast audio/video files
    UPLOAD_DIR: str = "uploads"

    # Groq Cloud API Key (Primary AI Provider for Whisper & LLaMA 3.3)
    GROQ_API_KEY: str = ""

    # Gemini GenAI API Key (Secondary/Fallback)
    GEMINI_API_KEY: str = ""

    # ElevenLabs Premium TTS Configuration
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"  # Default: Rachel (warm, calm, natural conversational narrator)
    ELEVENLABS_MODEL_ID: str = "eleven_multilingual_v2" # High-fidelity multilingual podcast narration model

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
