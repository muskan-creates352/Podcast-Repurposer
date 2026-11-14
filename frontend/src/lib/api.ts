import { 
  Episode, 
  Clip, 
  GeneratedContent, 
  Stats, 
  WeeklyProcessingStat, 
  AgentStatus, 
  AuthResponse 
} from "@/types";
import { 
  MOCK_STATS, 
  MOCK_EPISODES, 
  MOCK_CLIPS, 
  MOCK_GENERATED_CONTENT, 
  MOCK_WEEKLY_STATS, 
  MOCK_AGENTS 
} from "./mockData";

// Set to false to connect directly to the real FastAPI backend (http://localhost:8000/api)
// When false, it automatically falls back to mock data if the backend is unreachable.
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

function formatDuration(sec: number | string): string {
  const num = typeof sec === "string" ? parseFloat(sec) : sec;
  if (isNaN(num) || num <= 0) return typeof sec === "string" ? sec : "0:00";
  const m = Math.floor(num / 60);
  const s = Math.floor(num % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function formatTimestamp(sec: number | string): string {
  const num = typeof sec === "string" ? parseFloat(sec) : sec;
  if (isNaN(num)) return String(sec);
  const m = Math.floor(num / 60);
  const s = Math.floor(num % 60);
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

// -------------------------------------------------------------
// Authentication API
// -------------------------------------------------------------
export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    let displayName = "Muskan Kumari";
    const lowerEmail = (email || "").toLowerCase();
    if (lowerEmail.includes("shivani")) {
      displayName = "Shivani Patel";
    } else if (lowerEmail.includes("hamdaan") || lowerEmail.includes("mentor")) {
      displayName = "Hamdaan Sir";
    }

    return {
      user: {
        id: "usr_demo",
        email: email || "demo@podcastrepurposer.io",
        name: displayName,
      },
      token: "mock_jwt_token_sample_abc123",
    };
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Authentication failed");
    }

    const data = await res.json();
    return {
      user: {
        id: String(data.user?.id || "1"),
        email: data.user?.email || email,
        name: data.user?.full_name || "Creator",
      },
      token: data.access_token,
    };
  } catch (e: any) {
    console.warn("apiLogin live backend call failed, falling back to local session:", e);
    return {
      user: {
        id: "usr_fallback",
        email: email || "demo@podcastrepurposer.io",
        name: "Creator",
      },
      token: "jwt_session_token",
    };
  }
}

// -------------------------------------------------------------
// Stats & Dashboard API
// -------------------------------------------------------------
export async function fetchStats(): Promise<Stats> {
  if (USE_MOCK) {
    return MOCK_STATS;
  }

  try {
    const res = await fetch(`${BASE_URL}/dashboard/stats`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    const data = await res.json();
    return {
      total_episodes: data.total_episodes ?? 0,
      clips_generated: data.clips_generated ?? 0,
      pending_reviews: data.pending_reviews ?? 0,
      avg_processing_time: `${data.avg_processing_time ?? 42.5}s`,
    };
  } catch (err) {
    console.warn("fetchStats failed, using fallback:", err);
    return MOCK_STATS;
  }
}

export async function fetchWeeklyStats(): Promise<WeeklyProcessingStat[]> {
  if (USE_MOCK) {
    return MOCK_WEEKLY_STATS;
  }

  try {
    const res = await fetch(`${BASE_URL}/dashboard/weekly`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch weekly stats");
    const data = await res.json();
    return data.map((item: any) => ({
      week: item.week,
      episodes: item.episodes ?? item.count ?? 0,
      clips: item.clips ?? (item.count ? item.count * 3 : 0),
    }));
  } catch (err) {
    console.warn("fetchWeeklyStats failed, using fallback:", err);
    return MOCK_WEEKLY_STATS;
  }
}

export async function fetchAgentStatuses(): Promise<AgentStatus[]> {
  if (USE_MOCK) {
    return MOCK_AGENTS;
  }

  try {
    const res = await fetch(`${BASE_URL}/dashboard/agents/status`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch agent statuses");
    return await res.json();
  } catch (err) {
    console.warn("fetchAgentStatuses failed, using fallback:", err);
    return MOCK_AGENTS;
  }
}

// -------------------------------------------------------------
// Episodes API
// -------------------------------------------------------------
export async function fetchEpisodes(): Promise<Episode[]> {
  if (USE_MOCK) {
    return MOCK_EPISODES;
  }

  try {
    const res = await fetch(`${BASE_URL}/episodes`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch episodes");
    const data = await res.json();
    return data.map((ep: any) => ({
      id: String(ep.id),
      title: ep.title,
      status: ep.status,
      duration: formatDuration(ep.duration),
      created_at: ep.created_at,
      progress: ep.progress ?? 0,
    }));
  } catch (err) {
    console.warn("fetchEpisodes failed, using fallback:", err);
    return MOCK_EPISODES;
  }
}

export async function fetchEpisode(id: string): Promise<Episode | null> {
  if (USE_MOCK) {
    return MOCK_EPISODES.find((e) => e.id === id) || null;
  }

  try {
    const res = await fetch(`${BASE_URL}/episodes/${id}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error(`Failed to fetch episode ${id}`);
    const ep = await res.json();
    return {
      id: String(ep.id),
      title: ep.title,
      status: ep.status,
      duration: formatDuration(ep.duration),
      created_at: ep.created_at,
      progress: ep.progress ?? 0,
    };
  } catch (err) {
    console.warn(`fetchEpisode ${id} failed, using fallback:`, err);
    return MOCK_EPISODES.find((e) => e.id === id) || null;
  }
}

// -------------------------------------------------------------
// Clips & Content API
// -------------------------------------------------------------
export async function fetchClips(episodeId?: string): Promise<Clip[]> {
  if (USE_MOCK) {
    if (episodeId) {
      return MOCK_CLIPS.filter((c) => c.episode_id === episodeId);
    }
    return MOCK_CLIPS;
  }

  try {
    // If no episodeId is provided, fetch clips for episode 1 (or all episodes)
    const targetEpisodeId = episodeId || "1";
    const res = await fetch(`${BASE_URL}/episodes/${targetEpisodeId}/clips`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch clips");
    const data = await res.json();
    return data.map((c: any) => ({
      id: String(c.id),
      episode_id: String(c.episode_id),
      start_time: formatTimestamp(c.start_time),
      end_time: formatTimestamp(c.end_time),
      text: c.text,
      reason: c.reason || "High engagement highlight moment.",
      status: c.status,
    }));
  } catch (err) {
    console.warn("fetchClips failed, using fallback:", err);
    if (episodeId) {
      return MOCK_CLIPS.filter((c) => c.episode_id === episodeId);
    }
    return MOCK_CLIPS;
  }
}

export async function fetchGeneratedContent(episodeId: string): Promise<GeneratedContent[]> {
  if (USE_MOCK) {
    return MOCK_GENERATED_CONTENT.filter((g) => g.episode_id === episodeId);
  }

  try {
    const res = await fetch(`${BASE_URL}/episodes/${episodeId}/content`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch generated content");
    const data = await res.json();
    return data.map((item: any) => ({
      id: String(item.id),
      episode_id: String(item.episode_id),
      type: item.type,
      body: item.body,
      source_timestamps: item.source_timestamps || [],
      status: item.status,
    }));
  } catch (err) {
    console.warn("fetchGeneratedContent failed, using fallback:", err);
    return MOCK_GENERATED_CONTENT.filter((g) => g.episode_id === episodeId);
  }
}

export async function updateClipStatus(clipId: string, status: Clip["status"]): Promise<Clip> {
  try {
    const res = await fetch(`${BASE_URL}/clips/${clipId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update clip status");
    const c = await res.json();
    return {
      id: String(c.id),
      episode_id: String(c.episode_id),
      start_time: formatTimestamp(c.start_time),
      end_time: formatTimestamp(c.end_time),
      text: c.text,
      reason: c.reason,
      status: c.status,
    };
  } catch (err) {
    console.warn("updateClipStatus backend call failed, updating locally:", err);
    const clip = MOCK_CLIPS.find((c) => c.id === clipId);
    if (clip) clip.status = status;
    return clip ? { ...clip } : {
      id: clipId,
      episode_id: "1",
      start_time: "00:14",
      end_time: "00:42",
      text: "Clip updated",
      reason: "Editorial review",
      status: status,
    };
  }
}

export async function updateContentBody(contentId: string, body: string): Promise<GeneratedContent> {
  try {
    const res = await fetch(`${BASE_URL}/content/${contentId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ body, status: "approved" }),
    });
    if (!res.ok) throw new Error("Failed to update content");
    const item = await res.json();
    return {
      id: String(item.id),
      episode_id: String(item.episode_id),
      type: item.type,
      body: item.body,
      source_timestamps: item.source_timestamps || [],
      status: item.status,
    };
  } catch (err) {
    console.warn("updateContentBody backend call failed, updating locally:", err);
    const item = MOCK_GENERATED_CONTENT.find((c) => c.id === contentId);
    if (item) item.body = body;
    return item ? { ...item } : {
      id: contentId,
      episode_id: "1",
      type: "blog",
      body: body,
      source_timestamps: [],
      status: "approved",
    };
  }
}
