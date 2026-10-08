import { Episode, Clip, GeneratedContent, Stats, WeeklyProcessingStat, AgentStatus } from "@/types";

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
    progress: 0,
  },
];

export const MOCK_CLIPS: Clip[] = [
  {
    id: "clip_01",
    episode_id: "ep_01",
    start_time: "04:12",
    end_time: "05:08",
    text: "The reason why single-prompt LLMs fail in complex workflows is state management. Once you introduce a deterministic graph like LangGraph with clear state cycles, reliability jumps from 60% to over 95%.",
    reason: "High information density with a contrarian take on single-prompt architectures. Ideal hook for LinkedIn and YouTube Shorts.",
    status: "pending",
  },
  {
    id: "clip_02",
    episode_id: "ep_01",
    start_time: "18:45",
    end_time: "19:35",
    text: "If you want creators to actually trust AI output, you have to provide source timestamps. Never present a generated claim without showing exactly which second it was spoken.",
    reason: "Strong quote highlighting creator trust and grounding. High emotional engagement score.",
    status: "approved",
  },
  {
    id: "clip_03",
    episode_id: "ep_01",
    start_time: "32:10",
    end_time: "33:02",
    text: "Your podcast back-catalog is basically dormant gold. With vector search, every word spoken in the past two years becomes instant, searchable intelligence.",
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
3. **Bounded Repair Loops:** When an LLM schema validation fails, automatic retry nodes repair the output without causing infinite loops.`,
    source_timestamps: ["04:12 - 05:08", "18:45 - 19:35", "32:10 - 33:02"],
    status: "pending",
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

Timestamps:
[00:00] Intro & Guest Welcome
[04:12] Why Single-Prompt LLM Chains Fail
[18:45] Hallucination Control & Source Grounding
[32:10] Turning Podcast Archives into Vector Search Engines
[45:30] Wrap-up & Creator Takeaways`,
    source_timestamps: ["00:00 - 48:15"],
    status: "pending",
  },
];

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
    status: "running",
    currentTask: "Transcribing Ep. 40 (Chunk 3/8)",
    lastActive: "Just now",
    latency: "1.2s avg",
  },
  {
    id: "agent_highlight",
    name: "Highlight / Clip Agent",
    description: "Evaluates engagement density, viral hooks, and standalone clarity",
    status: "running",
    currentTask: "Scoring segments on Ep. 41",
    lastActive: "2m ago",
    latency: "2.4s avg",
  },
  {
    id: "agent_content",
    name: "Multi-Format Content Agent",
    description: "Drafts structured blogs, social threads, newsletters, and scripts",
    status: "completed",
    currentTask: "Drafted 3 formats for Ep. 42",
    lastActive: "5m ago",
    latency: "3.1s avg",
  },
  {
    id: "agent_explain",
    name: "Explanation & Grounding Agent",
    description: "Cites source audio timestamps and writes editorial justification notes",
    status: "completed",
    currentTask: "Verified provenance for Ep. 42",
    lastActive: "5m ago",
    latency: "1.8s avg",
  },
];
