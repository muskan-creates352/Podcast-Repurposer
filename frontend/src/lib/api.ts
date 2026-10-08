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
    await new Promise((r) => setTimeout(r, 600)); // simulate network delay
    if (password === "error") {
      throw new Error("Invalid email or password");
    }
    return {
      user: {
        id: "usr_01",
        email: email || "creator@podcastrepurposer.ai",
        name: email ? email.split("@")[0] : "Muskan Kumari",
      },
      token: "mock_jwt_token_sample_abc123",
    };
  }

  const res = await fetch(`${BASE_URL}/v1/auth/login`, {
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
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_STATS;
  }

  const res = await fetch(`${BASE_URL}/v1/analytics/overview`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function fetchWeeklyStats(): Promise<WeeklyProcessingStat[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_WEEKLY_STATS;
  }

  const res = await fetch(`${BASE_URL}/v1/analytics/weekly`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch weekly stats");
  return res.json();
}

export async function fetchAgentStatuses(): Promise<AgentStatus[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_AGENTS;
  }

  const res = await fetch(`${BASE_URL}/v1/agents/status`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch agent statuses");
  return res.json();
}

// -------------------------------------------------------------
// Episodes API
// -------------------------------------------------------------
export async function fetchEpisodes(): Promise<Episode[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_EPISODES;
  }

  const res = await fetch(`${BASE_URL}/v1/podcasts`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch episodes");
  return res.json();
}

export async function fetchEpisode(id: string): Promise<Episode | null> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_EPISODES.find((e) => e.id === id) || null;
  }

  const res = await fetch(`${BASE_URL}/v1/podcasts/${id}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Failed to fetch episode ${id}`);
  return res.json();
}

// -------------------------------------------------------------
// Clips & Content API
// -------------------------------------------------------------
export async function fetchClips(episodeId?: string): Promise<Clip[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 350));
    if (episodeId) {
      return MOCK_CLIPS.filter((c) => c.episode_id === episodeId);
    }
    return MOCK_CLIPS;
  }

  const url = episodeId 
    ? `${BASE_URL}/v1/podcasts/${episodeId}/clips` 
    : `${BASE_URL}/v1/clips`;
  const res = await fetch(url, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error("Failed to fetch clips");
  return res.json();
}

export async function fetchGeneratedContent(episodeId: string): Promise<GeneratedContent[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 350));
    return MOCK_GENERATED_CONTENT.filter((g) => g.episode_id === episodeId);
  }

  const res = await fetch(`${BASE_URL}/v1/podcasts/${episodeId}/content`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch generated content");
  return res.json();
}

export async function updateClipStatus(clipId: string, status: Clip["status"]): Promise<Clip> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const clip = MOCK_CLIPS.find((c) => c.id === clipId);
    if (!clip) throw new Error("Clip not found");
    clip.status = status;
    return { ...clip };
  }

  const res = await fetch(`${BASE_URL}/v1/clips/${clipId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update clip status");
  return res.json();
}

export async function updateContentBody(contentId: string, body: string): Promise<GeneratedContent> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const item = MOCK_GENERATED_CONTENT.find((c) => c.id === contentId);
    if (!item) throw new Error("Content item not found");
    item.body = body;
    return { ...item };
  }

  const res = await fetch(`${BASE_URL}/v1/content/${contentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error("Failed to update content");
  return res.json();
}
