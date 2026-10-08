// API CONTRACT TYPES (Exact entity mapping)

export type EpisodeStatus = 
  | 'uploaded' 
  | 'transcribing' 
  | 'processing' 
  | 'ready_for_review' 
  | 'published';

export interface Episode {
  id: string;
  title: string;
  status: EpisodeStatus;
  duration: string;
  created_at: string;
  progress: number;
}

export type ClipStatus = 'pending' | 'approved' | 'rejected';

export interface Clip {
  id: string;
  episode_id: string;
  start_time: string;
  end_time: string;
  text: string;
  reason: string;
  status: ClipStatus;
}

export type ContentType = 'blog' | 'social' | 'show_notes';

export interface GeneratedContent {
  id: string;
  episode_id: string;
  type: ContentType;
  body: string;
  source_timestamps: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface Stats {
  total_episodes: number;
  clips_generated: number;
  pending_reviews: number;
  avg_processing_time: string;
}

// UI & Analytics Types
export interface WeeklyProcessingStat {
  week: string;
  episodes: number;
  clips: number;
}

export type AgentState = 'idle' | 'running' | 'completed' | 'waiting';

export interface AgentStatus {
  id: string;
  name: string;
  description: string;
  status: AgentState;
  currentTask?: string;
  lastActive: string;
  latency: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
