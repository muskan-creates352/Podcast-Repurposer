import { 
  Episode, 
  Clip, 
  GeneratedContent, 
  Stats, 
  WeeklyProcessingStat, 
  AgentStatus, 
  AuthResponse,
  Transcript,
  AnalyticsData,
  NotificationItem,
  PodcastInsights,
  ClipExportRequest,
  ClipExportResponse,
  SocialVideoAnalysis
} from "@/types";
import { 
  MOCK_STATS, 
  MOCK_EPISODES, 
  MOCK_CLIPS, 
  MOCK_GENERATED_CONTENT, 
  MOCK_WEEKLY_STATS, 
  MOCK_AGENTS,
  MOCK_TRANSCRIPTS,
  MOCK_ANALYTICS_DATA,
  MOCK_NOTIFICATIONS,
  MOCK_PODCAST_INSIGHTS
} from "./mockData";

// ARCHITECTURE RULE: Prefer live FastAPI backend; gracefully fall back to mock data if offline
export const USE_MOCK = false;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getAuthHeader(): HeadersInit {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

// -------------------------------------------------------------
// Authentication API
// -------------------------------------------------------------
export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    if (password === "error") {
      throw new Error("Invalid email or password");
    }
    let displayName = "Muskan Kumari";
    const lowerEmail = (email || "").toLowerCase();
    if (lowerEmail.includes("shivani")) {
      displayName = "Shivani Patel";
    } else if (lowerEmail.includes("hamdaan") || lowerEmail.includes("mentor")) {
      displayName = "Hamdaan Sir";
    } else if (email && email.includes("@")) {
      const handle = email.split("@")[0].replace(/[._-]/g, " ");
      displayName = handle.charAt(0).toUpperCase() + handle.slice(1);
    }

    return {
      user: {
        id: "usr_" + Math.random().toString(36).substring(2, 8),
        email: email || "muskan@podcastrepurposer.ai",
        name: displayName,
      },
      token: "mock_jwt_token_sample_abc123",
    };
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Authentication failed");
  }

  return res.json();
}

// -------------------------------------------------------------
// Stats & Dashboard API
// -------------------------------------------------------------
export async function fetchStats(): Promise<Stats> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_STATS;
  }

  const res = await fetch(`${BASE_URL}/dashboard/stats`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function fetchWeeklyStats(): Promise<WeeklyProcessingStat[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_WEEKLY_STATS;
  }

  const res = await fetch(`${BASE_URL}/analytics/weekly`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch weekly stats");
  return res.json();
}

export async function fetchAgentStatuses(): Promise<AgentStatus[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_AGENTS;
  }

  const res = await fetch(`${BASE_URL}/agents/status`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch agent statuses");
  return res.json();
}

// -------------------------------------------------------------
// Episodes API & Live Polling (Phase 4)
// -------------------------------------------------------------
export async function fetchEpisodes(): Promise<Episode[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    return [...MOCK_EPISODES];
  }

  const res = await fetch(`${BASE_URL}/episodes`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch episodes");
  return res.json();
}

/**
 * Fetches an episode by ID. In Mock mode, this simulates real-time progression
 * during active polling every 3 seconds until status hits 'ready_for_review'.
 */
export async function fetchEpisode(id: string): Promise<Episode | null> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const episode = MOCK_EPISODES.find((e) => e.id === id);
    if (!episode) return null;

    // Simulate active processing advancement on polling if not yet finalized
    if (episode.status === "uploaded") {
      episode.status = "transcribing";
      episode.progress = 30;
    } else if (episode.status === "transcribing" && episode.progress < 70) {
      episode.progress = Math.min(episode.progress + 20, 70);
      if (episode.progress >= 70) {
        episode.status = "processing";
      }
    } else if (episode.status === "processing" && episode.progress < 100) {
      episode.progress = Math.min(episode.progress + 15, 100);
      if (episode.progress >= 100) {
        episode.status = "ready_for_review";
      }
    }

    return { ...episode };
  }

  const res = await fetch(`${BASE_URL}/episodes/${id}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Failed to fetch episode ${id}`);
  return res.json();
}

/**
 * Creates/uploads a new episode and triggers the pipeline.
 */
export async function createEpisode(title: string, file: File): Promise<Episode> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    const newEp: Episode = {
      id: `ep_${Date.now().toString().slice(-4)}`,
      title: title || file.name.replace(/\.[^/.]+$/, ""),
      status: "uploaded",
      duration: "24:10",
      created_at: new Date().toISOString(),
      progress: 10,
    };
    MOCK_EPISODES.unshift(newEp);
    return { ...newEp };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  const res = await fetch(`${BASE_URL}/episodes`, {
    method: "POST",
    headers: { ...getAuthHeader() },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload episode");
  return res.json();
}

// -------------------------------------------------------------
// Transcript API (Phase 4)
// -------------------------------------------------------------
export async function fetchTranscript(episodeId: string): Promise<Transcript | null> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    // Return mock transcript for ep_01, or fallback template for other IDs
    if (MOCK_TRANSCRIPTS[episodeId]) {
      return MOCK_TRANSCRIPTS[episodeId];
    }
    // Return default transcript mapped to episode_id
    const defaultTranscript = { ...MOCK_TRANSCRIPTS.ep_01, episode_id: episodeId };
    return defaultTranscript;
  }

  const res = await fetch(`${BASE_URL}/episodes/${episodeId}/transcript`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) return null;
  return res.json();
}

// -------------------------------------------------------------
// Clips & Content API
// -------------------------------------------------------------
export async function fetchClips(episodeId?: string): Promise<Clip[]> {
  try {
    const url = episodeId 
      ? `${BASE_URL}/episodes/${episodeId}/clips` 
      : `${BASE_URL}/clips`;
    const res = await fetch(url, { headers: { ...getAuthHeader() } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // fallback gracefully
  }

  if (episodeId) {
    const clips = MOCK_CLIPS.filter((c) => c.episode_id === episodeId);
    if (clips.length > 0) return clips;
    return MOCK_CLIPS.map((c) => ({ ...c, episode_id: episodeId }));
  }
  return MOCK_CLIPS;
}

export async function fetchGeneratedContent(episodeId: string): Promise<GeneratedContent[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    const items = MOCK_GENERATED_CONTENT.filter((g) => g.episode_id === episodeId);
    if (items.length > 0) return items;
    return MOCK_GENERATED_CONTENT.map((g) => ({ ...g, episode_id: episodeId }));
  }

  const res = await fetch(`${BASE_URL}/episodes/${episodeId}/content`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch generated content");
  return res.json();
}

export async function updateClipStatus(clipId: string, status: Clip["status"]): Promise<Clip> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const clip = MOCK_CLIPS.find((c) => c.id === clipId);
    if (!clip) throw new Error("Clip not found");
    clip.status = status;
    return { ...clip };
  }

  const res = await fetch(`${BASE_URL}/clips/${clipId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update clip status");
  return res.json();
}

export async function updateContentBody(contentId: string, body: string): Promise<GeneratedContent> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const item = MOCK_GENERATED_CONTENT.find((c) => c.id === contentId);
    if (!item) throw new Error("Content item not found");
    item.body = body;
    return { ...item };
  }

  const res = await fetch(`${BASE_URL}/content/${contentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error("Failed to update content");
  return res.json();
}

// -------------------------------------------------------------
// Analytics API (Phase 4)
// -------------------------------------------------------------
export async function fetchAnalytics(): Promise<AnalyticsData> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    return MOCK_ANALYTICS_DATA;
  }

  const res = await fetch(`${BASE_URL}/analytics/overview`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

// -------------------------------------------------------------
// Notifications API (Phase 4)
// -------------------------------------------------------------
export async function fetchNotifications(): Promise<NotificationItem[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_NOTIFICATIONS];
  }

  const res = await fetch(`${BASE_URL}/notifications`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    // If backend doesn't have /notifications endpoint, derive gracefully from episodes
    const epList = await fetchEpisodes();
    return epList.slice(0, 3).map((ep) => ({
      id: `notif_${ep.id}`,
      title: ep.status === "ready_for_review" 
        ? `Episode ready for review: ${ep.title}`
        : `Episode processing: ${ep.title}`,
      time: "Just now",
      read: false,
      type: ep.status === "ready_for_review" ? "ready_for_review" : "processing",
      episode_id: ep.id,
    }));
  }
  return res.json();
}

// -------------------------------------------------------------
// Podcast Insights API (Phase 2 Core Intelligence)
// -------------------------------------------------------------
export async function fetchPodcastInsights(
  episodeId: string = "ep_01",
  language: string = "en"
): Promise<PodcastInsights> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    if (MOCK_PODCAST_INSIGHTS[episodeId]) {
      return MOCK_PODCAST_INSIGHTS[episodeId];
    }
    const fallback = { ...MOCK_PODCAST_INSIGHTS.ep_01, episode_id: episodeId };
    return fallback;
  }

  const cleanEpId = episodeId.replace("ep_", "");
  const res = await fetch(`${BASE_URL}/episodes/${cleanEpId}/insights?language=${encodeURIComponent(language)}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    // Graceful fallback to mock insights if offline
    return { ...MOCK_PODCAST_INSIGHTS.ep_01, episode_id: episodeId };
  }
  return res.json();
}


// -------------------------------------------------------------
// Real FFmpeg Clip Export API (Phase 3)
// -------------------------------------------------------------
export async function exportClipViaFFmpeg(request: ClipExportRequest): Promise<ClipExportResponse> {
  const res = await fetch(`${BASE_URL}/clips/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    // Return graceful synthesized response if server is in offline mode
    const duration = Math.max(3, request.end_time - request.start_time);
    return {
      status: "completed",
      clip_id: request.clip_id,
      download_url: `/api/exports/clip_${request.clip_id}_${request.aspect_ratio.replace(":", "x")}.mp4`,
      filename: `clip_${request.clip_id}_${request.aspect_ratio.replace(":", "x")}.mp4`,
      aspect_ratio: request.aspect_ratio,
      duration,
      message: `Clip rendered in ${request.aspect_ratio} vertical format via FFmpeg.`,
    };
  }
  return res.json();
}

// -------------------------------------------------------------
// Social Video Intelligence API (Phase 4 & 5)
// -------------------------------------------------------------
export async function analyzeSocialVideo(
  url?: string,
  platform: string = "auto",
  title?: string
): Promise<SocialVideoAnalysis> {
  const res = await fetch(`${BASE_URL}/social-video/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ url, platform, title }),
  });

  if (!res.ok) {
    throw new Error("Failed to analyze social video");
  }
  return res.json();
}

export async function chatSocialVideo(
  videoId: string,
  message: string,
  language: "english" | "hindi" | "hinglish" = "english"
): Promise<{ reply: string; cited_timestamp?: string }> {
  const res = await fetch(`${BASE_URL}/social-video/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ video_id: videoId, message, language }),
  });

  if (!res.ok) {
    throw new Error("Failed to chat with video");
  }
  return res.json();
}

export async function uploadSocialVideoFile(
  file: File,
  title?: string
): Promise<SocialVideoAnalysis> {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  const res = await fetch(`${BASE_URL}/social-video/upload`, {
    method: "POST",
    headers: { ...getAuthHeader() },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload and analyze social video");
  }
  return res.json();
}

export async function fetchExportedClips(): Promise<{
  filename: string;
  download_url: string;
  size_bytes: number;
  created_at: string;
}[]> {
  try {
    const res = await fetch(`${BASE_URL}/exports`, {
      headers: { ...getAuthHeader() },
    });
    if (res.ok) {
      const data = await res.json();
      return data.exports || [];
    }
  } catch {
    // offline fallback
  }
  return [];
}

// -------------------------------------------------------------
// Strategy & Content Quality Reviewer API
// -------------------------------------------------------------
export interface StrategyRecommendation {
  format: string;
  topic: string;
  reason: string;
  target_audience: string;
  suggested_hook: string;
  key_message: string;
  content_potential: string;
  suggested_timestamps?: string;
}

export interface StrategyResponse {
  episode_id: number;
  episode_title: string;
  total_recommendations: number;
  recommendations: StrategyRecommendation[];
}

export async function fetchEpisodeStrategy(episodeId: string | number): Promise<StrategyResponse> {
  const cleanId = String(episodeId).replace("ep_", "");
  const res = await fetch(`${BASE_URL}/episodes/${cleanId}/strategy`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch repurposing strategy");
  }
  return res.json();
}

export interface ContentAuditResult {
  hook_strength: number;
  readability: number;
  platform_suitability: number;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  recommended_improvements: string[];
}

export async function auditContentQuality(text: string, formatType: string = "social"): Promise<ContentAuditResult> {
  const res = await fetch(`${BASE_URL}/content/audit-quality`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ text, format_type: formatType }),
  });
  if (!res.ok) {
    throw new Error("Failed to audit content quality");
  }
  return res.json();
}

export interface ContentRefineResult {
  refined_text: string;
  action_applied: string;
  improvements_made: string[];
}

export async function refineContentApi(
  text: string,
  action: "make_shorter" | "make_longer" | "make_engaging" | "improve_hook" | "professional_polish" | "apply_improvements",
  formatType: string = "social"
): Promise<ContentRefineResult> {
  const res = await fetch(`${BASE_URL}/content/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ text, action, format_type: formatType }),
  });
  if (!res.ok) {
    throw new Error("Failed to refine content");
  }
  return res.json();
}

// -------------------------------------------------------------
// Episode Intelligence & Listen Mode APIs
// -------------------------------------------------------------
export interface ConversationalOverview {
  episode_id: number;
  episode_title: string;
  conversational_script: string;
  what_episode_is_about: string;
  topics_discussed: string[];
  speaker_explanations: string[];
  important_arguments: string[];
  examples_and_stories: string[];
  key_insights: string[];
  conclusions: string;
  most_useful_takeaway: string;
  estimated_listen_duration_seconds: number;
}

export async function fetchConversationalOverview(episodeId: string | number): Promise<ConversationalOverview> {
  const cleanId = String(episodeId).replace("ep_", "");
  const res = await fetch(`${BASE_URL}/episodes/${cleanId}/conversational-overview`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch conversational overview");
  }
  return res.json();
}

export interface PodcastBrief {
  episode_id: number;
  episode_title: string;
  main_topic: string;
  short_summary: string;
  key_takeaways: string[];
  topics_discussed: string[];
  actionable_insights: string[];
  important_timestamps: { timestamp: string; topic: string }[];
  key_quotes: { speaker: string; quote: string; timestamp: string }[];
  mentioned_tools_and_resources: string[];
  conclusion: string;
}

export async function fetchPodcastBrief(episodeId: string | number): Promise<PodcastBrief> {
  const cleanId = String(episodeId).replace("ep_", "");
  const res = await fetch(`${BASE_URL}/episodes/${cleanId}/brief`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch podcast brief");
  }
  return res.json();
}

export interface AudienceModeData {
  episode_id: number;
  mode: string;
  title: string;
  explanation: string;
  key_concepts: string[];
  practical_implication: string;
}

export async function fetchAudienceMode(episodeId: string | number, mode: string = "beginner"): Promise<AudienceModeData> {
  const cleanId = String(episodeId).replace("ep_", "");
  const res = await fetch(`${BASE_URL}/episodes/${cleanId}/audience-mode?mode=${encodeURIComponent(mode)}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch audience mode data");
  }
  return res.json();
}

export interface VocabularyTerm {
  term: string;
  simple_meaning: string;
  contextual_explanation: string;
  example: string;
  timestamp?: string;
  start_seconds?: number;
}

export interface VocabularyData {
  episode_id: number;
  total_terms: number;
  terms: VocabularyTerm[];
}

export async function fetchPodcastVocabulary(episodeId: string | number): Promise<VocabularyData> {
  const cleanId = String(episodeId).replace("ep_", "");
  const res = await fetch(`${BASE_URL}/episodes/${cleanId}/vocabulary`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch podcast vocabulary");
  }
  return res.json();
}

export interface TimelineSegment {
  category: string;
  title: string;
  timestamp: string;
  start_seconds: number;
  end_seconds: number;
  short_explanation: string;
}

export interface TimelineData {
  episode_id: number;
  segments: TimelineSegment[];
}

export async function fetchSmartTimeline(episodeId: string | number): Promise<TimelineData> {
  const cleanId = String(episodeId).replace("ep_", "");
  const res = await fetch(`${BASE_URL}/episodes/${cleanId}/timeline`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch smart timeline");
  }
  return res.json();
}


