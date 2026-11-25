import os
import re
import hashlib
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

CACHE_DIR = Path("uploads") / "audio_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def clean_text_for_narration(text: str) -> str:
    """
    Normalizes and cleans podcast text for natural ElevenLabs AI voice narration:
    - Strips timestamps like [00:15], 00:15 - 01:30, [04:12]
    - Strips markdown headers (#), bold (**text**), italics (*text*), blockquotes (>)
    - Cleans markdown links [text](url) -> text
    - Strips slide tags like '--- Slide 1: Hook ---'
    - Strips excessive emojis and symbols while preserving acronyms, names, and numbers.
    """
    if not text:
        return ""

    t = text
    # Remove timestamps like [00:15], [00:15:30], 00:15 - 01:30
    t = re.sub(r"\[\d{1,2}:\d{2}(?::\d{2})?(?:\s*-\s*\d{1,2}:\d{2}(?::\d{2})?)?\]", "", t)
    t = re.sub(r"\b\d{1,2}:\d{2}(?::\d{2})?\b\s*-\s*\b\d{1,2}:\d{2}(?::\d{2})?\b", "", t)
    t = re.sub(r"\b\d{1,2}:\d{2}\b", "", t)

    # Remove markdown formatting
    t = re.sub(r"---.*?---", "", t)  # slide delimiters
    t = re.sub(r"```[\s\S]*?```", "", t)  # code blocks
    t = re.sub(r"`([^`]+)`", r"\1", t)  # inline code
    t = re.sub(r"^#{1,6}\s+", "", t, flags=re.MULTILINE)  # headers
    t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)  # bold
    t = re.sub(r"\*([^*]+)\*", r"\1", t)  # italics
    t = re.sub(r"_([^_]+)_", r"\1", t)  # underscores
    t = re.sub(r"~~([^~]+)~~", r"\1", t)  # strikethrough
    t = re.sub(r"^>\s+", "", t, flags=re.MULTILINE)  # blockquotes
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)  # links [text](url) -> text
    t = re.sub(r"https?://\S+", "", t)  # raw URLs
    t = re.sub(r"^[-*+]\s+", "", t, flags=re.MULTILINE)  # bullet dashes
    t = re.sub(r"^\d+\.\s+", "", t, flags=re.MULTILINE)  # numbered lists

    # Strip decorative symbols and common emojis while leaving punctuation
    t = re.sub(r"[✨🔥💡🎯💎👉📌💬🚀•🪄❌✅🧵🎙️]", "", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def chunk_text_for_narration(text: str, max_chars: int = 2000) -> List[str]:
    """
    Chunks long text along sentence or paragraph boundaries
    to respect ElevenLabs character limits while preserving cadence.
    """
    if len(text) <= max_chars:
        return [text]

    chunks = []
    # Split by paragraphs first
    paragraphs = text.split("\n\n")
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current_chunk) + len(para) + 2 <= max_chars:
            current_chunk = f"{current_chunk}\n\n{para}".strip()
        else:
            if current_chunk:
                chunks.append(current_chunk)
                current_chunk = ""

            # If single paragraph is larger than max_chars, split on sentences
            if len(para) > max_chars:
                sentences = re.split(r"(?<=[.!?])\s+", para)
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) + 1 <= max_chars:
                        current_chunk = f"{current_chunk} {sentence}".strip()
                    else:
                        if current_chunk:
                            chunks.append(current_chunk)
                        current_chunk = sentence
            else:
                current_chunk = para

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


def get_elevenlabs_credentials():
    api_key = settings.ELEVENLABS_API_KEY or os.environ.get("ELEVENLABS_API_KEY", "")
    voice_id = settings.ELEVENLABS_VOICE_ID or os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
    model_id = settings.ELEVENLABS_MODEL_ID or os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")
    return api_key.strip(), voice_id.strip(), model_id.strip()


def synthesize_podcast_speech(
    text: str,
    voice_id: Optional[str] = None,
    model_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Synthesizes speech using ElevenLabs API with persistent MP3 caching.
    If ELEVENLABS_API_KEY is not set or API fails, returns structured fallback state.
    """
    cleaned_text = clean_text_for_narration(text)
    if not cleaned_text:
        return {
            "status": "error",
            "message": "Empty or invalid narration text.",
            "cleaned_text": "",
        }

    api_key, default_voice, default_model = get_elevenlabs_credentials()
    active_voice = voice_id.strip() if voice_id and voice_id.strip() else default_voice
    active_model = model_id.strip() if model_id and model_id.strip() else default_model

    # Check cache based on hash of text + voice + model
    cache_string = f"{active_voice}_{active_model}_{cleaned_text}"
    cache_key = hashlib.sha256(cache_string.encode("utf-8")).hexdigest()
    cached_file = CACHE_DIR / f"{cache_key}.mp3"

    # Estimate audio duration (approx 150 words per minute)
    words = len(cleaned_text.split())
    duration_est = max(10, round((words / 150) * 60))

    # Return cached audio immediately if already generated
    if cached_file.exists() and cached_file.stat().st_size > 100:
        logger.info(f"[ElevenLabs TTS] Serving cached audio for key {cache_key}")
        return {
            "status": "success",
            "audio_url": f"/api/tts/audio/{cache_key}.mp3",
            "cache_key": cache_key,
            "duration_estimated_seconds": duration_est,
            "voice_used": f"ElevenLabs ({active_voice[:6]}...)",
            "model_used": active_model,
            "engine": "elevenlabs",
            "is_cached": True,
            "cleaned_text": cleaned_text,
        }

    # If no API key configured, return fallback state
    if not api_key:
        logger.info("[ElevenLabs TTS] ELEVENLABS_API_KEY is not configured; offering browser voice fallback.")
        return {
            "status": "fallback",
            "audio_url": None,
            "duration_estimated_seconds": duration_est,
            "engine": "browser_fallback",
            "message": "ElevenLabs API key is not configured. Browser-native speech synthesis fallback active.",
            "cleaned_text": cleaned_text,
        }

    # Generate via ElevenLabs API
    chunks = chunk_text_for_narration(cleaned_text, max_chars=2000)
    audio_bytes_list: List[bytes] = []

    try:
        with httpx.Client(timeout=45.0) as client:
            for idx, chunk in enumerate(chunks):
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{active_voice}"
                headers = {
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg",
                }
                payload = {
                    "text": chunk,
                    "model_id": active_model,
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                        "style": 0.0,
                        "use_speaker_boost": True,
                    },
                }

                logger.info(f"[ElevenLabs TTS] Requesting chunk {idx + 1}/{len(chunks)} ({len(chunk)} chars)")
                res = client.post(url, headers=headers, json=payload)

                if res.status_code == 401:
                    logger.error("[ElevenLabs TTS] 401 Unauthorized: Invalid API key.")
                    return {
                        "status": "fallback",
                        "audio_url": None,
                        "engine": "browser_fallback",
                        "message": "Invalid ElevenLabs API Key. Using browser fallback.",
                        "cleaned_text": cleaned_text,
                    }
                elif res.status_code == 429:
                    logger.warning("[ElevenLabs TTS] 429 Rate Limited.")
                    return {
                        "status": "fallback",
                        "audio_url": None,
                        "engine": "browser_fallback",
                        "message": "ElevenLabs rate limit exceeded. Using browser fallback.",
                        "cleaned_text": cleaned_text,
                    }
                elif res.status_code == 402:
                    logger.warning("[ElevenLabs TTS] 402 Insufficient credits.")
                    return {
                        "status": "fallback",
                        "audio_url": None,
                        "engine": "browser_fallback",
                        "message": "Insufficient ElevenLabs character credits. Using browser fallback.",
                        "cleaned_text": cleaned_text,
                    }
                elif not res.is_success:
                    logger.error(f"[ElevenLabs TTS] HTTP error {res.status_code}: {res.text}")
                    return {
                        "status": "fallback",
                        "audio_url": None,
                        "engine": "browser_fallback",
                        "message": f"ElevenLabs error {res.status_code}. Using browser fallback.",
                        "cleaned_text": cleaned_text,
                    }

                audio_bytes_list.append(res.content)

        # Concatenate audio frames and save to cache
        combined_audio = b"".join(audio_bytes_list)
        with open(cached_file, "wb") as f:
            f.write(combined_audio)

        logger.info(f"[ElevenLabs TTS] Audio successfully synthesized and saved ({len(combined_audio)} bytes)")
        return {
            "status": "success",
            "audio_url": f"/api/tts/audio/{cache_key}.mp3",
            "cache_key": cache_key,
            "duration_estimated_seconds": duration_est,
            "voice_used": f"ElevenLabs ({active_voice[:6]}...)",
            "model_used": active_model,
            "engine": "elevenlabs",
            "is_cached": False,
            "cleaned_text": cleaned_text,
        }

    except httpx.TimeoutException:
        logger.warning("[ElevenLabs TTS] Request timed out. Using browser fallback.")
        return {
            "status": "fallback",
            "audio_url": None,
            "engine": "browser_fallback",
            "message": "ElevenLabs connection timed out. Using browser fallback.",
            "cleaned_text": cleaned_text,
        }
    except Exception as e:
        logger.error(f"[ElevenLabs TTS] Unexpected error: {str(e)}")
        return {
            "status": "fallback",
            "audio_url": None,
            "engine": "browser_fallback",
            "message": f"TTS synthesis error: {str(e)}. Using browser fallback.",
            "cleaned_text": cleaned_text,
        }
