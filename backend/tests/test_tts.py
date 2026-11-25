import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_tts_status_endpoint():
    response = client.get("/api/tts/status")
    assert response.status_code == 200
    data = response.json()
    assert "configured" in data
    assert "provider" in data
    assert data["provider"].lower() == "elevenlabs"
    assert "default_voice_id" in data
    assert "model_id" in data


def test_tts_synthesize_empty_text():
    response = client.post("/api/tts/synthesize", json={"text": "   "})
    assert response.status_code == 400
    assert "cannot be empty" in response.json()["detail"].lower()


def test_tts_synthesize_valid_text():
    response = client.post(
        "/api/tts/synthesize",
        json={
            "text": "Welcome to AI Podcast Repurposer. This is a high quality test narration."
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] in ["ready", "fallback"]
    assert "cache_key" in data
    assert "cleaned_text" in data
    assert len(data["cleaned_text"]) > 0


def test_tts_audio_path_traversal_protection():
    response = client.get("/api/tts/audio/../../etc/passwd.mp3")
    assert response.status_code in [400, 404]

    response_invalid = client.get("/api/tts/audio/not-a-valid-sha256-hash.mp3")
    assert response_invalid.status_code == 400
    assert "Invalid audio filename" in response_invalid.json()["detail"]


def test_intelligence_conversational_overview():
    response = client.get("/api/episodes/1/conversational-overview")
    assert response.status_code == 200
    data = response.json()
    assert data["episode_id"] == 1
    assert "episode_title" in data
    assert "conversational_script" in data
    assert len(data["conversational_script"]) > 20
    assert "what_episode_is_about" in data
    assert "topics_discussed" in data
    assert "most_useful_takeaway" in data


def test_intelligence_brief():
    response = client.get("/api/episodes/1/brief")
    assert response.status_code == 200
    data = response.json()
    assert data["episode_id"] == 1
    assert "episode_title" in data
    assert "main_topic" in data
    assert "short_summary" in data
    assert "key_quotes" in data
    assert "mentioned_tools_and_resources" in data


def test_intelligence_audience_mode():
    response = client.get("/api/episodes/1/audience-mode?mode=beginner")
    assert response.status_code == 200
    data = response.json()
    assert data["episode_id"] == 1
    assert data["mode"] == "beginner"
    assert "explanation" in data
    assert "key_concepts" in data

    # Test developer mode
    dev_resp = client.get("/api/episodes/1/audience-mode?mode=developer")
    assert dev_resp.status_code == 200
    assert dev_resp.json()["mode"] == "developer"


def test_intelligence_vocabulary():
    response = client.get("/api/episodes/1/vocabulary")
    assert response.status_code == 200
    data = response.json()
    assert data["episode_id"] == 1
    assert "terms" in data
    assert len(data["terms"]) > 0
    assert "term" in data["terms"][0]
    assert "simple_meaning" in data["terms"][0]
    assert "contextual_explanation" in data["terms"][0]


def test_intelligence_timeline():
    response = client.get("/api/episodes/1/timeline")
    assert response.status_code == 200
    data = response.json()
    assert data["episode_id"] == 1
    assert "segments" in data
    assert len(data["segments"]) > 0
    assert "category" in data["segments"][0]
    assert "timestamp" in data["segments"][0]
