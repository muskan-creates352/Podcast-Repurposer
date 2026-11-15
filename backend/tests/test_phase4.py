import io
import asyncio
import pytest
from app.models.episode import Episode
from app.models.transcript import Transcript
from app.models.clip import Clip
from app.models.content import GeneratedContent
from app.models.audit import AuditLog
from app.ai.audio_processor import merge_chunk_segments, format_timestamp
from app.services.transcription_service import transcribe_episode_audio
from app.ai.workflow import run_langgraph_pipeline


def test_audio_processor_timestamp_merging():
    # Chunk 1 (offset 0.0)
    chunk1_segs = [
        {"start": 0.0, "end": 10.0, "speaker": "Speaker 1", "text": "Hello world", "confidence": 0.95},
        {"start": 10.0, "end": 20.0, "speaker": "Speaker 2", "text": "Muffled speech", "confidence": 0.65},
    ]
    # Chunk 2 (offset 300.0)
    chunk2_segs = [
        {"start": 0.0, "end": 15.0, "speaker": "Speaker 1", "text": "Part two", "confidence": 0.92},
    ]

    merged, has_low = merge_chunk_segments(
        [(chunk1_segs, 0.0), (chunk2_segs, 300.0)],
        confidence_threshold=0.75,
    )

    assert len(merged) == 3
    # First chunk segment
    assert merged[0]["start"] == 0.0
    assert merged[0]["end"] == 10.0
    assert merged[0]["low_confidence"] is False

    # Second chunk segment (confidence 0.65 < 0.75)
    assert merged[1]["low_confidence"] is True
    assert has_low is True

    # Third chunk segment with 300s offset
    assert merged[2]["start"] == 300.0
    assert merged[2]["end"] == 315.0
    assert merged[2]["speaker"] == "Speaker 1"


def test_transcription_service_with_confidence_and_segments(db_session):
    episode = Episode(
        title="Test Transcription Episode",
        status="uploaded",
        duration=120.0,
        progress=0,
    )
    db_session.add(episode)
    db_session.commit()
    db_session.refresh(episode)

    transcript = transcribe_episode_audio(db_session, episode)

    assert transcript.episode_id == episode.id
    assert len(transcript.segments) > 0
    first_seg = transcript.segments[0]
    assert "start" in first_seg
    assert "end" in first_seg
    assert "speaker" in first_seg
    assert "confidence" in first_seg
    assert "low_confidence" in first_seg


def test_langgraph_pipeline_execution(client, db_session):
    # Upload an episode
    fake_audio = io.BytesIO(b"audio stream bytes for pipeline test")
    fake_audio.name = "pipeline_test.mp3"
    upload_res = client.post(
        "/api/episodes",
        files={"file": ("pipeline_test.mp3", fake_audio, "audio/mpeg")},
        data={"title": "LangGraph End-to-End Episode"},
    )
    assert upload_res.status_code == 201
    ep_id = upload_res.json()["id"]

    # Run LangGraph pipeline asynchronously
    asyncio.run(run_langgraph_pipeline(episode_id=ep_id))

    # Verify Episode status is now 'ready_for_review' and progress == 100
    ep_res = client.get(f"/api/episodes/{ep_id}")
    assert ep_res.status_code == 200
    ep_data = ep_res.json()
    assert ep_data["status"] == "ready_for_review"
    assert ep_data["progress"] == 100

    # Verify Clips contract: { id, episode_id, start_time, end_time, text, reason, status }
    clips_res = client.get(f"/api/episodes/{ep_id}/clips")
    assert clips_res.status_code == 200
    clips = clips_res.json()
    assert len(clips) >= 1
    c = clips[0]
    assert c["episode_id"] == ep_id
    assert "start_time" in c
    assert "end_time" in c
    assert "text" in c
    assert "reason" in c
    assert c["status"] in ["pending", "approved", "rejected"]

    # Verify GeneratedContent contract: { id, episode_id, type, body, source_timestamps, status }
    content_res = client.get(f"/api/episodes/{ep_id}/content")
    assert content_res.status_code == 200
    contents = content_res.json()
    assert len(contents) == 3
    types = {item["type"] for item in contents}
    assert types == {"blog", "social", "show_notes"}
    for item in contents:
        assert item["episode_id"] == ep_id
        assert len(item["body"]) > 0
        assert item["status"] == "pending"
        assert item["source_timestamps"] is not None


def test_notifications_endpoint(client, db_session):
    res = client.get("/api/notifications")
    assert res.status_code == 200
    notifs = res.json()
    assert isinstance(notifs, list)
    if len(notifs) > 0:
        n = notifs[0]
        assert "id" in n
        assert "episode_id" in n
        assert "title" in n
        assert "message" in n
        assert "type" in n
        assert "created_at" in n


def test_analytics_endpoint(client, db_session):
    res = client.get("/api/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "approval_rate" in data
    assert "avg_processing_time" in data
    assert "content_types_generated" in data
    assert "episodes_per_week" in data
    assert "total_episodes" in data
    assert "total_clips" in data
    assert "pending_reviews" in data
    assert isinstance(data["content_types_generated"], dict)


def test_reviews_and_audit(client, db_session):
    # Create clip to review
    ep = Episode(title="Review Test Ep", status="ready_for_review", duration=60.0, progress=100)
    db_session.add(ep)
    db_session.commit()

    clip = Clip(
        episode_id=ep.id,
        start_time=5.0,
        end_time=25.0,
        text="Original text",
        reason="Good moment",
        status="pending",
    )
    db_session.add(clip)
    db_session.commit()

    # Review clip (Approve and edit text)
    patch_res = client.patch(
        f"/api/clips/{clip.id}/review",
        json={"status": "approved", "text": "Edited text for viral clip"},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "approved"
    assert updated["text"] == "Edited text for viral clip"

    # Check AuditLog
    audit_res = client.get(f"/api/audit?episode_id={ep.id}")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert isinstance(logs, list)


def test_search_endpoint(client, db_session):
    # Upload episode with transcript containing specific keyword
    ep = Episode(title="Searchable AI Episode", status="ready_for_review", duration=100.0, progress=100)
    db_session.add(ep)
    db_session.commit()

    t = Transcript(
        episode_id=ep.id,
        language="en",
        raw_text="Discussion about quantum neural networks.",
        segments=[
            {
                "start": 10.0,
                "end": 20.0,
                "speaker": "Speaker 1",
                "text": "Discussion about quantum neural networks.",
            }
        ],
    )
    db_session.add(t)
    db_session.commit()

    search_res = client.get("/api/search?q=quantum")
    assert search_res.status_code == 200
    matches = search_res.json()
    assert len(matches) >= 1
    assert matches[0]["episode_id"] == ep.id
    assert "quantum" in matches[0]["snippet"].lower()
    assert matches[0]["start_time"] == 10.0
