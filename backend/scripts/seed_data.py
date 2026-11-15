import sys
import os
from datetime import datetime, timedelta, timezone

# Add parent directory to path so script can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User
from app.models.project import Project
from app.models.episode import Episode
from app.models.transcript import Transcript
from app.models.clip import Clip
from app.models.content import GeneratedContent
from app.models.audit import AuditLog


def seed_database(reset: bool = False):
    if reset:
        print("Reset flag specified. Dropping and re-creating database tables...")
        Base.metadata.drop_all(bind=engine)
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if not reset and db.query(Episode).count() > 0:
            print("Database already contains episodes. Skipping seed to prevent duplicate entries.")
            print("Tip: Run with '--reset' or '--force' to wipe and re-seed sample data (e.g., python scripts/seed_data.py --reset).")
            return

        print("Seeding sample user...")
        demo_user = User(
            email="demo@podcastrepurposer.io",
            hashed_password=hash_password("Password123!"),
            full_name="Demo Creator",
            is_active=True,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        demo_project = Project(
            name="Main Tech Series",
            description="Flagship podcast series covering emerging AI and creator tools.",
            user_id=demo_user.id,
        )
        db.add(demo_project)
        db.commit()
        db.refresh(demo_project)

        now = datetime.now(timezone.utc)

        # 5 Sample Episodes
        sample_episodes_data = [
            {
                "title": "Ep 101: The Future of Multimodal AI Agents",
                "status": "ready_for_review",
                "duration": 2450.0,
                "progress": 100,
                "created_at": now - timedelta(days=22),
                "has_full_pipeline": True,
            },
            {
                "title": "Ep 102: Architecting Resilient Distributed Pipelines",
                "status": "ready_for_review",
                "duration": 3120.0,
                "progress": 100,
                "created_at": now - timedelta(days=15),
                "has_full_pipeline": True,
            },
            {
                "title": "Ep 103: Creator Economy: Building Scalable Micro-SaaS",
                "status": "processing",
                "duration": 1890.0,
                "progress": 65,
                "created_at": now - timedelta(days=8),
                "has_full_pipeline": False,
            },
            {
                "title": "Ep 104: Prompt Engineering vs Supervised Fine-Tuning",
                "status": "transcribing",
                "duration": 2780.0,
                "progress": 30,
                "created_at": now - timedelta(days=3),
                "has_full_pipeline": False,
            },
            {
                "title": "Ep 105: Behind the Mic: Raw Maintainer Interviews",
                "status": "uploaded",
                "duration": 3600.0,
                "progress": 0,
                "created_at": now - timedelta(hours=4),
                "has_full_pipeline": False,
            },
        ]

        print("Seeding 5 sample episodes with clips, transcripts, and generated content...")
        for ep_data in sample_episodes_data:
            has_pipeline = ep_data.pop("has_full_pipeline")
            episode = Episode(
                **ep_data,
                project_id=demo_project.id,
                user_id=demo_user.id,
                file_name=f"{ep_data['title'].replace(' ', '_').lower()}.mp3",
                file_path=f"uploads/{ep_data['title'].replace(' ', '_').lower()}.mp3",
                file_size=1024 * 1024 * 25,
            )
            db.add(episode)
            db.commit()
            db.refresh(episode)

            # Realistic timestamped transcript
            segments = [
                {
                    "start": 0.0,
                    "end": 14.5,
                    "speaker": "Speaker 1 (Alex - Host)",
                    "text": f"Welcome everyone to this session on {episode.title}. Today we break down the practical realities.",
                },
                {
                    "start": 14.5,
                    "end": 42.0,
                    "speaker": "Speaker 2 (Sarah - Guest)",
                    "text": "The fundamental shift right now is automated repurposing. Turning one recording into five distribution formats saves countless editor hours.",
                },
                {
                    "start": 42.0,
                    "end": 78.5,
                    "speaker": "Speaker 1 (Alex - Host)",
                    "text": "And the key requirement is that every AI generated clip or blog citation must trace directly back to exact audio timestamps.",
                },
                {
                    "start": 78.5,
                    "end": 115.0,
                    "speaker": "Speaker 2 (Sarah - Guest)",
                    "text": "When your pipeline grounds its claims in real audio moments, creators trust the output, and approval velocity jumps 5x.",
                },
            ]
            raw_text = " ".join([f"[{s['speaker']}]: {s['text']}" for s in segments])

            transcript = Transcript(
                episode_id=episode.id,
                language="en",
                raw_text=raw_text,
                segments=segments,
                created_at=ep_data["created_at"],
            )
            db.add(transcript)

            if has_pipeline:
                # Add Clips matching Clip contract:
                # { id, episode_id, start_time, end_time, text, reason, status }
                clip1 = Clip(
                    episode_id=episode.id,
                    start_time=14.5,
                    end_time=42.0,
                    text="The fundamental shift right now is automated repurposing. Turning one recording into five distribution formats saves countless editor hours.",
                    reason="Strong opening thesis with clear value proposition for creator workflows. High viral potential.",
                    status="approved",
                    score=0.95,
                    created_at=ep_data["created_at"],
                )
                clip2 = Clip(
                    episode_id=episode.id,
                    start_time=78.5,
                    end_time=115.0,
                    text="When your pipeline grounds its claims in real audio moments, creators trust the output, and approval velocity jumps 5x.",
                    reason="Data-driven insight emphasizing AI grounding and human review trust.",
                    status="pending",
                    score=0.88,
                    created_at=ep_data["created_at"],
                )
                clip3 = Clip(
                    episode_id=episode.id,
                    start_time=0.0,
                    end_time=14.5,
                    text=f"Welcome everyone to this session on {episode.title}.",
                    reason="Intro greeting clip; standard context marker.",
                    status="rejected",
                    score=0.55,
                    created_at=ep_data["created_at"],
                )
                db.add_all([clip1, clip2, clip3])

                # Add Generated Content matching GeneratedContent contract:
                # { id, episode_id, type, body, source_timestamps, status }
                # Types: blog | social | show_notes
                blog_content = GeneratedContent(
                    episode_id=episode.id,
                    type="blog",
                    body=(
                        f"# Mastering Content Leverage: Key Insights from {episode.title}\n\n"
                        "In this episode, we dive deep into how creators can scale their media operations.\n\n"
                        "### 1. The Bottleneck of Manual Editing\n"
                        "Traditional workflows trap valuable podcast content in hard drives. Manual editing takes upwards of 6 hours per episode.\n\n"
                        "### 2. Grounded AI Generation\n"
                        "By utilizing timestamped grounding, AI pipelines create trustworthy summaries and clips directly citing the source audio.\n\n"
                        "### Key Takeaway\n"
                        "Automation with human review is the future of digital publishing."
                    ),
                    source_timestamps=["00:14 - 00:42", "01:18 - 01:55"],
                    status="approved",
                    created_at=ep_data["created_at"],
                )

                social_content = GeneratedContent(
                    episode_id=episode.id,
                    type="social",
                    body=(
                        "🧵 1/4 Most podcasters waste 90% of their recorded material.\n\n"
                        "Here is how automated timestamped repurposing changes everything:\n\n"
                        "2/4 Instead of spending 5 hours scrubbing audio, AI highlights high-energy insights and generates short video scripts.\n\n"
                        "3/4 Crucial rule: Always ground AI claims with exact transcript timestamps so editors can verify in 1 click.\n\n"
                        "4/4 Check out the full breakdown in our latest episode! #CreatorEconomy #Podcasting #GenAI"
                    ),
                    source_timestamps=["00:14 - 00:42", "00:42 - 01:15"],
                    status="pending",
                    created_at=ep_data["created_at"],
                )

                show_notes_content = GeneratedContent(
                    episode_id=episode.id,
                    type="show_notes",
                    body=(
                        f"## Episode Show Notes: {episode.title}\n\n"
                        "**Timestamps & Chapters:**\n"
                        "- [00:00] Introduction & Episode Context\n"
                        "- [00:14] The Shift Toward Automated Repurposing\n"
                        "- [00:42] Why Timestamp Citations Matter for Verification\n"
                        "- [01:18] Building Trust with Human-in-the-Loop Workflows\n\n"
                        "**Resources Mentioned:**\n"
                        "- AI Podcast Repurposer Platform\n"
                        "- Multi-format Creator Framework"
                    ),
                    source_timestamps=["00:00 - 01:55"],
                    status="approved",
                    created_at=ep_data["created_at"],
                )

                db.add_all([blog_content, social_content, show_notes_content])

            # Audit log
            audit = AuditLog(
                user_id=demo_user.id,
                action="EPISODE_SEEDED",
                resource_type="episode",
                resource_id=episode.id,
                details={"title": episode.title, "status": episode.status},
                created_at=ep_data["created_at"],
            )
            db.add(audit)

        db.commit()
        print("Successfully seeded 5 sample episodes, clips, transcripts, and generated content!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    reset_mode = any(arg in sys.argv for arg in ("--reset", "--force", "-f", "-r"))
    seed_database(reset=reset_mode)
