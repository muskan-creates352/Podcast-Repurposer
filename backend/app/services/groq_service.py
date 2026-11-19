import os
import json
import re
import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

# Supported Groq Models
GROQ_TEXT_MODEL = "llama-3.3-70b-versatile"
GROQ_FAST_MODEL = "llama-3.1-8b-instant"
GROQ_WHISPER_MODEL = "whisper-large-v3-turbo"


def get_groq_api_key() -> str:
    """Retrieves the Groq API key from settings or OS environment."""
    key = (settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY") or "").strip()
    if key.startswith("your_") or key.startswith("dummy"):
        return ""
    return key


def get_groq_client():
    """Initializes and returns the Groq client if an API key is available."""
    api_key = get_groq_api_key()
    if not api_key:
        return None
    try:
        from groq import Groq
        return Groq(api_key=api_key)
    except Exception as e:
        logger.warning(f"Failed to initialize Groq client: {e}")
        return None


def get_groq_status() -> Dict[str, Any]:
    """
    Verifies Groq Cloud API connectivity, available models, and returns health status.
    Never exposes the raw API key.
    """
    api_key = get_groq_api_key()
    if not api_key:
        return {
            "configured": False,
            "connected": False,
            "provider": "Groq Cloud",
            "text_model": GROQ_TEXT_MODEL,
            "whisper_model": GROQ_WHISPER_MODEL,
            "message": "GROQ_API_KEY is not configured in backend/.env. Enter your key in Settings to activate real-time LLaMA 3.3 and Whisper Turbo.",
        }

    client = get_groq_client()
    if not client:
        return {
            "configured": True,
            "connected": False,
            "provider": "Groq Cloud",
            "text_model": GROQ_TEXT_MODEL,
            "whisper_model": GROQ_WHISPER_MODEL,
            "message": "Groq SDK could not be initialized.",
        }

    try:
        models = client.models.list()
        model_ids = [m.id for m in models.data]
        return {
            "configured": True,
            "connected": True,
            "provider": "Groq Cloud",
            "text_model": GROQ_TEXT_MODEL,
            "whisper_model": GROQ_WHISPER_MODEL,
            "models_available": len(model_ids),
            "message": f"Connected to Groq Cloud ({GROQ_TEXT_MODEL} + {GROQ_WHISPER_MODEL} ready).",
        }
    except Exception as e:
        return {
            "configured": True,
            "connected": False,
            "provider": "Groq Cloud",
            "text_model": GROQ_TEXT_MODEL,
            "whisper_model": GROQ_WHISPER_MODEL,
            "message": f"Groq API error: {str(e)}",
        }


def clean_json_output(raw: str) -> str:
    """Removes markdown backticks and cleans LLM text for JSON parsing."""
    if not raw:
        return "{}"
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def run_groq_text_completion(
    prompt: str,
    system_instruction: str = "You are an elite podcast intelligence and repurposing strategist.",
    temperature: float = 0.2,
    max_tokens: int = 2500,
    model: str = GROQ_TEXT_MODEL,
    json_mode: bool = False,
) -> Optional[str]:
    """
    Executes a prompt on Groq Cloud using LLaMA 3.3.
    """
    client = get_groq_client()
    if not client:
        return None

    try:
        kwargs: Dict[str, Any] = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        chat_completion = client.chat.completions.create(**kwargs)
        return chat_completion.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq text completion failed with model {model}: {e}")
        return None


def transcribe_audio_with_groq_whisper(
    file_path: str,
    language: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Transcribes audio using Groq Cloud Whisper Large v3 Turbo.
    Returns timestamped verbose JSON transcript.
    """
    client = get_groq_client()
    if not client or not os.path.exists(file_path):
        return None

    try:
        with open(file_path, "rb") as audio_file:
            kwargs: Dict[str, Any] = {
                "file": audio_file,
                "model": GROQ_WHISPER_MODEL,
                "response_format": "verbose_json",
            }
            if language:
                kwargs["language"] = language

            transcription = client.audio.transcriptions.create(**kwargs)
            # transcription returns a verbose object with .text and .segments
            return transcription.to_dict() if hasattr(transcription, "to_dict") else vars(transcription)
    except Exception as e:
        logger.error(f"Groq Whisper transcription failed for {file_path}: {e}")
        return None


def generate_podcast_intelligence_groq(
    title: str,
    transcript_text: str,
    segments: List[Dict[str, Any]],
    language: str = "en",
) -> Optional[Dict[str, Any]]:
    """
    Uses Groq LLaMA 3.3 to produce 3-tier summaries, smart chapters, main topics,
    and key takeaways in the requested language (en, hi, hinglish).
    """
    client = get_groq_client()
    if not client or not transcript_text:
        return None

    lang_instruction = "Respond in English."
    if language == "hi":
        lang_instruction = "Respond entirely in clean modern Hindi (Devanagari script) with clear podcast terminology."
    elif language == "hinglish":
        lang_instruction = "Respond in natural Hinglish (Roman Hindi-English mix as spoken by creators and tech podcasts in India)."

    system_prompt = f"""You are an elite podcast producer and editorial intelligence agent.
Language requirement: {lang_instruction}
CRITICAL RULES:
1. Ground all claims directly in the provided transcript text.
2. Return strictly valid JSON conforming to the schema below.
3. Include real timestamps (e.g. '01:24 - 03:15') based on the segment boundaries.

JSON SCHEMA:
{{
  "overview": {{
    "podcast_title": "{title}",
    "explanation": "3-5 sentence overarching synthesis of the podcast",
    "purpose": "Why this episode was created",
    "central_idea": "Core thesis",
    "subjects_covered": ["Subject 1", "Subject 2", "Subject 3", "Subject 4", "Subject 5"]
  }},
  "summaries": {{
    "thirty_seconds": "Concise 30-second elevator pitch summary",
    "one_minute": "Structured 1-minute summary",
    "detailed": "Comprehensive markdown breakdown with headings and points",
    "five_takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3", "Takeaway 4", "Takeaway 5"]
  }},
  "topics": [
    {{"title": "Topic name", "timestamp": "00:00 - 05:00", "description": "Short explanation", "significance": "Why it matters"}}
  ],
  "chapters": [
    {{"title": "Chapter title", "start_time": 0.0, "end_time": 120.0, "timestamp_formatted": "00:00 - 02:00", "summary": "Summary"}}
  ],
  "takeaways": [
    {{"id": 1, "point": "Actionable takeaway", "actionable_tip": "Concrete implementation tip", "timestamp": "01:15"}}
  ]
}}
"""

    prompt = f"""Episode Title: {title}
Selected Language: {language}
Transcript:
{transcript_text[:12000]}

Generate the podcast intelligence JSON now:"""

    raw = run_groq_text_completion(
        prompt=prompt,
        system_instruction=system_prompt,
        model=GROQ_TEXT_MODEL,
        json_mode=True,
    )
    if not raw:
        return None

    try:
        cleaned = clean_json_output(raw)
        return json.loads(cleaned)
    except Exception as err:
        logger.warning(f"Failed to parse Groq intelligence JSON: {err}")
        return None


def chat_with_podcast_groq(
    user_message: str,
    podcast_title: str,
    transcript_text: str,
    segments: List[Dict[str, Any]],
    chat_history: Optional[List[Dict[str, str]]] = None,
    language: str = "en",
) -> Dict[str, Any]:
    """
    RAG-powered conversational agent using Groq LLaMA 3.3.
    Cites specific timestamps and answers in the user's preferred language.
    """
    client = get_groq_client()
    if not client:
        return {
            "reply": "Groq API key is not configured in backend/.env. Please configure GROQ_API_KEY to enable live AI chat.",
            "citations": [],
            "source": "fallback",
        }

    lang_note = "Reply in English."
    if language == "hi":
        lang_note = "Reply in Hindi (Devanagari)."
    elif language == "hinglish":
        lang_note = "Reply in natural conversational Hinglish (Roman script)."

    system_prompt = f"""You are the official AI Podcast Assistant for '{podcast_title}'.
{lang_note}
CRITICAL RULES:
1. Answer the user's question accurately using ONLY facts from the provided transcript.
2. If the answer appears in the recording, cite the exact timestamp in [MM:SS] format.
3. If the transcript does not mention the topic, clearly state that the episode does not cover it.
4. Keep answers engaging, structured, and helpful for creators and listeners.
"""

    context_prompt = f"""PODCAST TITLE: {podcast_title}
TRANSCRIPT CONTENT:
{transcript_text[:10000]}

USER QUESTION:
{user_message}
"""

    messages = [{"role": "system", "content": system_prompt}]
    if chat_history:
        for msg in chat_history[-6:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    messages.append({"role": "user", "content": context_prompt})

    try:
        res = client.chat.completions.create(
            model=GROQ_TEXT_MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=1000,
        )
        reply_text = res.choices[0].message.content

        # Extract [MM:SS] citations from the reply
        citations = re.findall(r"\[(\d{1,2}:\d{2}(?:\s*-\s*\d{1,2}:\d{2})?)\]", reply_text)

        return {
            "reply": reply_text,
            "citations": citations,
            "source": f"groq ({GROQ_TEXT_MODEL})",
        }
    except Exception as e:
        logger.error(f"Groq podcast chat failed: {e}")
        return {
            "reply": f"Groq AI chat encountered an issue: {str(e)}",
            "citations": [],
            "source": "error",
        }
