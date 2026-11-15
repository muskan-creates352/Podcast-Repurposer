import { 
  Episode, 
  Clip, 
  GeneratedContent, 
  Stats, 
  WeeklyProcessingStat, 
  AgentStatus, 
  Transcript, 
  AnalyticsData, 
  NotificationItem 
} from "@/types";

export const MOCK_STATS: Stats = {
  total_episodes: 28,
  clips_generated: 142,
  pending_reviews: 12,
  avg_processing_time: "4.2 min",
};

export const MOCK_EPISODES: Episode[] = [
  {
    id: "ep_01",
    title: "Ep. 42: Building Autonomous Multi-Agent AI Systems with LangGraph",
    status: "ready_for_review",
    duration: "48:15",
    created_at: "2026-10-07T14:30:00Z",
    progress: 100,
  },
  {
    id: "ep_02",
    title: "Ep. 41: How Creators Scale Content Output Using AI Workflows",
    status: "processing",
    duration: "36:40",
    created_at: "2026-10-08T09:15:00Z",
    progress: 68,
  },
  {
    id: "ep_03",
    title: "Ep. 40: The Architecture of Next-Gen Vector Search & Embeddings",
    status: "transcribing",
    duration: "54:20",
    created_at: "2026-10-08T11:00:00Z",
    progress: 25,
  },
  {
    id: "ep_04",
    title: "Ep. 39: Monetizing Niche Newsletters and Micro-Podcasts in 2026",
    status: "published",
    duration: "42:10",
    created_at: "2026-10-05T16:00:00Z",
    progress: 100,
  },
  {
    id: "ep_05",
    title: "Ep. 38: Bootstrapping a SaaS to $50k MRR Without VC Funding",
    status: "published",
    duration: "51:05",
    created_at: "2026-09-30T10:20:00Z",
    progress: 100,
  },
  {
    id: "ep_06",
    title: "Ep. 37: Deep Dive into Cloud Native Storage & Edge Compute",
    status: "uploaded",
    duration: "39:50",
    created_at: "2026-10-08T12:00:00Z",
    progress: 10,
  },
];

export const MOCK_CLIPS: Clip[] = [
  {
    id: "clip_01",
    episode_id: "ep_01",
    start_time: "04:12",
    end_time: "05:08",
    text: "The reason why single-prompt LLMs fail in complex workflows is state management. Once you introduce a deterministic graph like LangGraph with clear state cycles, reliability jumps from 60% to over 95%.",
    reason: "High information density with a contrarian take on single-prompt architectures. Ideal viral hook for LinkedIn and YouTube Shorts.",
    status: "pending",
  },
  {
    id: "clip_02",
    episode_id: "ep_01",
    start_time: "18:45",
    end_time: "19:35",
    text: "If you want creators to actually trust AI output, you have to provide source timestamps. Never present a generated claim without showing exactly which second it was spoken in the audio.",
    reason: "Strong quote highlighting creator trust, provenance, and grounding. High emotional engagement score.",
    status: "approved",
  },
  {
    id: "clip_03",
    episode_id: "ep_01",
    start_time: "32:10",
    end_time: "33:02",
    text: "Your podcast back-catalog is basically dormant gold. With vector search, every word spoken in the past two years becomes instant, searchable intelligence for your audience.",
    reason: "Direct value proposition for RAG and archive search. Great educational teaser.",
    status: "pending",
  },
];

export const MOCK_GENERATED_CONTENT: GeneratedContent[] = [
  {
    id: "gen_01",
    episode_id: "ep_01",
    type: "blog",
    body: `# Why State Machines are Replacing Simple Prompts in Production AI

In Episode 42 of the Podcast, we discussed why building autonomous agentic workflows requires moving beyond basic LLM prompt chaining.

## 3 Core Architectural Takeaways
1. **Deterministic State Transitions:** When dealing with multi-step workflows like transcription, highlight detection, and multi-format drafting, agents must share a strongly typed state object.
2. **Grounding & Provenance:** Every generated takeaway must map directly back to a transcript timestamp.
3. **Bounded Repair Loops:** When an LLM schema validation fails, automatic retry nodes repair the output without causing infinite loops.

## Summary for Engineering Teams
Single-shot prompt chaining is fragile. When each agent has isolated responsibility and updates a shared memory state, debugging complex multi-speaker audio transcripts becomes trivial.`,
    source_timestamps: ["04:12 - 05:08", "18:45 - 19:35", "32:10 - 33:02"],
    status: "approved",
  },
  {
    id: "gen_02",
    episode_id: "ep_01",
    type: "social",
    body: `Most AI tools hallucinate because they have no anchor to reality. 🎙️

In our latest podcast episode, we broke down how to build grounded AI pipelines:

1️⃣ Always link generated bullet points to exact audio timestamps.
2️⃣ Run independent agents in parallel (Highlight Agent + Content Agent).
3️⃣ Give human editors a 1-click review studio before publishing.

Listen to the full breakdown: [link] 🧵👇`,
    source_timestamps: ["18:45 - 19:35"],
    status: "approved",
  },
  {
    id: "gen_03",
    episode_id: "ep_01",
    type: "show_notes",
    body: `Episode 42: Building Autonomous Multi-Agent AI Systems with LangGraph

Episode Overview:
In this session, we sit down with AI systems architects to uncover why deterministic state machines outperform naive prompt chaining for long-form audio processing.

Key Timestamps & Topics:
[00:00] Intro & Guest Welcome
[04:12] Why Single-Prompt LLM Chains Fail & State Graphs Win
[18:45] Hallucination Control, Provenance & Source Grounding
[32:10] Turning Podcast Archives into Vector Search Engines
[45:30] Wrap-up & Creator Takeaways

Resources Mentioned:
- LangGraph Orchestration Framework
- Gemini Flash 2.0 & Whisper ASR models
- Audio Repurposing Architecture Spec`,
    source_timestamps: ["00:00 - 48:15"],
    status: "pending",
  },
];

export const MOCK_TRANSCRIPTS: Record<string, Transcript> = {
  ep_01: {
    episode_id: "ep_01",
    language: "en",
    raw_text: "Welcome back to the podcast. Today we are diving into autonomous multi-agent systems...",
    segments: [
      {
        id: "seg_01",
        start: 0,
        end: 18,
        speaker: "Host (Muskan)",
        text: "Welcome back everyone! Today we have an incredible episode exploring how autonomous multi-agent AI systems are built with deterministic state graphs.",
      },
      {
        id: "seg_02",
        start: 19,
        end: 45,
        speaker: "Guest (Dr. Alex)",
        text: "Thanks Muskan. It's exciting to be here. A lot of creators and developers are struggling with LLM reliability when processing 60-minute conversations.",
      },
      {
        id: "seg_03",
        start: 46,
        end: 120,
        speaker: "Host (Muskan)",
        text: "Exactly. People try to dump a 10,000-word transcript into a single prompt and ask for clips, blog posts, and timestamps all at once, and it breaks down.",
      },
      {
        id: "seg_04",
        start: 252, // 04:12
        end: 308, // 05:08
        speaker: "Guest (Dr. Alex)",
        text: "The reason why single-prompt LLMs fail in complex workflows is state management. Once you introduce a deterministic graph like LangGraph with clear state cycles, reliability jumps from 60% to over 95%.",
      },
      {
        id: "seg_05",
        start: 309,
        end: 420,
        speaker: "Host (Muskan)",
        text: "That 95% threshold is the difference between an AI toy and an enterprise workflow that creators can trust every single week.",
      },
      {
        id: "seg_06",
        start: 1125, // 18:45
        end: 1175, // 19:35
        speaker: "Guest (Dr. Alex)",
        text: "If you want creators to actually trust AI output, you have to provide source timestamps. Never present a generated claim without showing exactly which second it was spoken in the audio.",
      },
      {
        id: "seg_07",
        start: 1176,
        end: 1300,
        speaker: "Host (Muskan)",
        text: "That is why our studio has clickable timestamp citations right next to every generated highlight card.",
      },
      {
        id: "seg_08",
        start: 1930, // 32:10
        end: 1982, // 33:02
        speaker: "Guest (Dr. Alex)",
        text: "Your podcast back-catalog is basically dormant gold. With vector search, every word spoken in the past two years becomes instant, searchable intelligence for your audience.",
      },
      {
        id: "seg_09",
        start: 1983,
        end: 2895, // 48:15
        speaker: "Host (Muskan)",
        text: "Thank you so much Alex! This has been a masterclass in modern AI systems engineering. Make sure to check the show notes for links.",
      },
    ],
  },
  ep_02: {
    episode_id: "ep_02",
    language: "en",
    raw_text: "Scaling content output as a solo creator with AI agents...",
    segments: [
      {
        id: "seg_21",
        start: 0,
        end: 30,
        speaker: "Host (Muskan)",
        text: "Welcome to Episode 41. Today we discuss scaling content output as a solo creator.",
      },
      {
        id: "seg_22",
        start: 31,
        end: 95,
        speaker: "Guest (Sarah)",
        text: "When you repurpose one podcast into 5 clips and a newsletter, your audience reach multiplies exponentially without burnout.",
      },
    ],
  },
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_01",
    title: "Episode ready for review: Ep. 42 (LangGraph Multi-Agent)",
    time: "2m ago",
    read: false,
    type: "ready_for_review",
    episode_id: "ep_01",
  },
  {
    id: "notif_02",
    title: "Transcription finished for Ep. 41: Audio converted to text",
    time: "18m ago",
    read: false,
    type: "processing",
    episode_id: "ep_02",
  },
  {
    id: "notif_03",
    title: "Processing failed for Ep. 36: Invalid audio header detected",
    time: "1h ago",
    read: true,
    type: "failed",
    episode_id: "ep_06",
  },
];

export const MOCK_ANALYTICS_DATA: AnalyticsData = {
  episodes_per_week: [
    { week: "Wk 1", episodes: 3, clips: 14 },
    { week: "Wk 2", episodes: 5, clips: 26 },
    { week: "Wk 3", episodes: 4, clips: 22 },
    { week: "Wk 4", episodes: 7, clips: 38 },
    { week: "Wk 5", episodes: 6, clips: 31 },
    { week: "Wk 6", episodes: 9, clips: 48 },
  ],
  approval_vs_rejection: [
    { name: "Approved", value: 118, color: "#10b981" },
    { name: "Pending Review", value: 16, color: "#f59e0b" },
    { name: "Rejected", value: 8, color: "#ef4444" },
  ],
  avg_processing_time_trend: [
    { week: "Wk 1", avg_time_min: 7.2 },
    { week: "Wk 2", avg_time_min: 6.4 },
    { week: "Wk 3", avg_time_min: 5.8 },
    { week: "Wk 4", avg_time_min: 4.9 },
    { week: "Wk 5", avg_time_min: 4.5 },
    { week: "Wk 6", avg_time_min: 3.8 },
  ],
  content_types_breakdown: [
    { type: "Video Clips", count: 142 },
    { type: "Blog Posts", count: 48 },
    { type: "Social Threads", count: 86 },
    { type: "Show Notes", count: 28 },
  ],
};

export const MOCK_WEEKLY_STATS: WeeklyProcessingStat[] = [
  { week: "Wk 1", episodes: 3, clips: 14 },
  { week: "Wk 2", episodes: 5, clips: 26 },
  { week: "Wk 3", episodes: 4, clips: 22 },
  { week: "Wk 4", episodes: 7, clips: 38 },
  { week: "Wk 5", episodes: 6, clips: 31 },
  { week: "Wk 6", episodes: 9, clips: 48 },
];

export const MOCK_AGENTS: AgentStatus[] = [
  {
    id: "agent_asr",
    name: "Transcription Engine",
    description: "Speech-to-text with word-level timestamps & speaker diarization",
    status: "completed",
    currentTask: "Transcription complete with 99.2% confidence",
    lastActive: "Just now",
    latency: "1.2s avg",
  },
  {
    id: "agent_highlight",
    name: "Highlight / Clip Agent",
    description: "Evaluates engagement density, viral hooks, and standalone clarity",
    status: "completed",
    currentTask: "Extracted 3 viral clips with verified justification",
    lastActive: "2m ago",
    latency: "2.4s avg",
  },
  {
    id: "agent_content",
    name: "Multi-Format Content Agent",
    description: "Drafts structured blogs, social threads, newsletters, and scripts",
    status: "completed",
    currentTask: "Drafted 3 formats (Blog, Social, Show Notes)",
    lastActive: "5m ago",
    latency: "3.1s avg",
  },
  {
    id: "agent_explain",
    name: "Explanation & Grounding Agent",
    description: "Cites source audio timestamps and writes editorial justification notes",
    status: "completed",
    currentTask: "Verified provenance for all generated outputs",
    lastActive: "5m ago",
    latency: "1.8s avg",
  },
];
