import io
import pytest
from app.models.episode import Episode
from app.models.clip import Clip
from app.models.content import GeneratedContent


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_auth_registration_and_login(client):
    # 1. Register new user
    register_payload = {
        "email": "testuser@example.com",
        "password": "SecurePassword123!",
        "full_name": "Test User",
    }
    reg_res = client.post("/api/auth/register", json=register_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "testuser@example.com"
    token = reg_data["access_token"]

    # 2. Duplicate registration fails
    dup_res = client.post("/api/auth/register", json=register_payload)
    assert dup_res.status_code == 400

    # 3. Login with correct password
    login_res = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "SecurePassword123!"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Login with incorrect password
    bad_login = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "WrongPassword"},
    )
    assert bad_login.status_code == 401

    # 5. Access protected /api/auth/me
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "testuser@example.com"


def test_episode_upload_and_contract(client):
    # Upload an episode with dummy audio bytes
    fake_audio = io.BytesIO(b"RIFF....WAVEfmt ....data....fake_audio_stream")
    fake_audio.name = "viva_demo_episode.mp3"

    res = client.post(
        "/api/episodes",
        files={"file": ("viva_demo_episode.mp3", fake_audio, "audio/mpeg")},
        data={"title": "Viva Demo Episode - AI Pipelines"},
    )
    assert res.status_code == 201
    data = res.json()

    # Check exact contract fields: { id, title, status, duration, created_at, progress }
    assert "id" in data
    assert data["title"] == "Viva Demo Episode - AI Pipelines"
    assert data["status"] == "uploaded"
    assert data["progress"] == 0
    assert "duration" in data
    assert "created_at" in data

    episode_id = data["id"]

    # Fetch single episode
    get_res = client.get(f"/api/episodes/{episode_id}")
    assert get_res.status_code == 200
    single = get_res.json()
    assert single["id"] == episode_id
    assert single["status"] == "uploaded"

    # List episodes
    list_res = client.get("/api/episodes")
    assert list_res.status_code == 200
    episodes = list_res.json()
    assert isinstance(episodes, list)
    assert any(ep["id"] == episode_id for ep in episodes)


def test_episode_transcript_realistic_dummy(client):
    # Upload episode first
    fake_audio = io.BytesIO(b"sample audio stream")
    fake_audio.name = "transcribe_test.mp3"
    upload_res = client.post(
        "/api/episodes",
        files={"file": ("transcribe_test.mp3", fake_audio, "audio/mpeg")},
        data={"title": "Transcript Test Episode"},
    )
    episode_id = upload_res.json()["id"]

    # Get transcript
    res = client.get(f"/api/episodes/{episode_id}/transcript")
    assert res.status_code == 200
    t_data = res.json()
    assert t_data["episode_id"] == episode_id
    assert "segments" in t_data
    assert len(t_data["segments"]) > 0

    first_segment = t_data["segments"][0]
    assert "start" in first_segment
    assert "end" in first_segment
    assert "speaker" in first_segment
    assert "text" in first_segment


def test_dashboard_stats_and_weekly(client, db_session):
    # Seed a clip and content directly to test statistics computation
    fake_audio = io.BytesIO(b"sample audio stream")
    fake_audio.name = "dashboard_test.mp3"
    upload_res = client.post(
        "/api/episodes",
        files={"file": ("dashboard_test.mp3", fake_audio, "audio/mpeg")},
        data={"title": "Stats Test Episode"},
    )
    episode_id = upload_res.json()["id"]

    clip = Clip(
        episode_id=episode_id,
        start_time=10.0,
        end_time=30.0,
        text="A test highlight moment",
        reason="Viral engagement potential",
        status="pending",
    )
    content = GeneratedContent(
        episode_id=episode_id,
        type="blog",
        body="A generated blog post body",
        source_timestamps=["00:10 - 00:30"],
        status="pending",
    )
    db_session.add(clip)
    db_session.add(content)
    db_session.commit()

    # Query GET /api/dashboard/stats
    stats_res = client.get("/api/dashboard/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()

    # Contract: { total_episodes, clips_generated, pending_reviews, avg_processing_time }
    assert "total_episodes" in stats
    assert "clips_generated" in stats
    assert "pending_reviews" in stats
    assert "avg_processing_time" in stats
    assert stats["total_episodes"] >= 1
    assert stats["clips_generated"] >= 1
    assert stats["pending_reviews"] >= 2

    # Query GET /api/dashboard/weekly
    weekly_res = client.get("/api/dashboard/weekly")
    assert weekly_res.status_code == 200
    weekly = weekly_res.json()
    assert isinstance(weekly, list)
    assert len(weekly) == 4
    assert "week" in weekly[0]
    assert "count" in weekly[0]
