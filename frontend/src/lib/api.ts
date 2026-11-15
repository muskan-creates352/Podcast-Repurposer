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
  PodcastInsights
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

// ARCHITECTURE RULE: Central flag to switch between mock data and real FastAPI backend
export const USE_MOCK = true;

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
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    if (episodeId) {
      const clips = MOCK_CLIPS.filter((c) => c.episode_id === episodeId);
      if (clips.length > 0) return clips;
      // Synthesize clips for new or other episodes so demo is rich
      return MOCK_CLIPS.map((c) => ({ ...c, episode_id: episodeId }));
    }
    return MOCK_CLIPS;
  }

  const url = episodeId 
    ? `${BASE_URL}/episodes/${episodeId}/clips` 
    : `${BASE_URL}/clips`;
  const res = await fetch(url, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error("Failed to fetch clips");
  return res.json();
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
export async function fetchPodcastInsights(episodeId: string = "ep_01"): Promise<PodcastInsights> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    if (MOCK_PODCAST_INSIGHTS[episodeId]) {
      return MOCK_PODCAST_INSIGHTS[episodeId];
    }
    // Return ep_01 insights mapped to the requested episode
    const fallback = { ...MOCK_PODCAST_INSIGHTS.ep_01, episode_id: episodeId };
    return fallback;
  }

  const res = await fetch(`${BASE_URL}/episodes/${episodeId}/insights`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    // Graceful fallback to mock insights if offline
    return { ...MOCK_PODCAST_INSIGHTS.ep_01, episode_id: episodeId };
  }
  return res.json();
}
