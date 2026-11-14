import os
import json
import re
import logging
from typing import Type, TypeVar, Optional, Callable, Any
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


def clean_json_text(text: str) -> str:
    """Strips markdown code fences and cleans raw LLM string for JSON parsing."""
    if not text:
        return "{}"
    cleaned = text.strip()
    # Remove ```json ... ``` or ``` ... ```
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def get_genai_client():
    """Initializes and returns the google-genai Client if API key is present."""
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
    if not api_key or api_key.startswith("dummy"):
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.warning(f"Failed to initialize google-genai Client: {e}")
        return None


def generate_structured_gemini(
    prompt: str,
    system_instruction: str,
    schema_class: Type[T],
    fallback_factory: Callable[[], T],
    audio_path: Optional[str] = None,
    model_name: str = "gemini-2.5-flash",
) -> T:
    """
    Executes a structured Gemini generation call.
    Features:
    1. Directs Gemini to produce strict JSON conforming to schema_class.
    2. Validates JSON output using Pydantic.
    3. Retries ONCE automatically with error feedback if output is invalid.
    4. Catches timeouts, quota limits, and network errors, logging clear messages
       and returning a deterministic grounded fallback so college viva demos never crash.
    """
    client = get_genai_client()
    if client is None:
        logger.info("Gemini API key not configured or set to dummy. Using grounded fallback pipeline.")
        return fallback_factory()

    try:
        from google.genai import types

        # Prepare contents
        contents: list = []
        if audio_path and os.path.exists(audio_path):
            try:
                # Upload audio file via Gemini Files API for audio understanding
                audio_file = client.files.upload(file=audio_path)
                contents.append(audio_file)
            except Exception as upload_err:
                logger.warning(f"Audio file upload to Gemini failed: {upload_err}. Continuing with text prompt.")

        contents.append(prompt)

        # First Attempt
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            temperature=0.2,
        )

        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=config,
        )

        raw_text = response.text or ""
        cleaned = clean_json_text(raw_text)

        try:
            data = json.loads(cleaned)
            return schema_class.model_validate(data)
        except Exception as validation_err:
            logger.warning(
                f"Attempt 1 JSON validation failed for {schema_class.__name__}: {validation_err}. "
                "Retrying once with schema repair feedback..."
            )

            # Automatic Retry (1 Attempt)
            retry_prompt = (
                f"Your previous output failed schema validation with error: {validation_err}.\n"
                f"Here was your output:\n{cleaned[:500]}\n\n"
                f"You MUST return strictly valid JSON conforming exactly to this schema:\n"
                f"{json.dumps(schema_class.model_json_schema())}\n\n"
                f"Original Task:\n{prompt}"
            )

            retry_response = client.models.generate_content(
                model=model_name,
                contents=[retry_prompt],
                config=config,
            )

            retry_text = clean_json_text(retry_response.text or "")
            retry_data = json.loads(retry_text)
            return schema_class.model_validate(retry_data)

    except Exception as e:
        logger.error(
            f"Gemini API execution failed: {type(e).__name__} - {e}. "
            "Engaging resilient fallback to preserve demo continuity."
        )
        return fallback_factory()
