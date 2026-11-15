// API CONTRACT TYPES (Exact entity mapping - DO NOT MODIFY CONTRACT FIELDS)

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

// -------------------------------------------------------------
// Transcript & Grounding Types (Phase 4)
// -------------------------------------------------------------
export interface TranscriptSegment {
  id: string;
  start: number; // timestamp in seconds, e.g. 15.2
  end: number;   // timestamp in seconds, e.g. 24.5
  speaker: string;
  text: string;
  low_confidence?: boolean;
}

export interface Transcript {
  episode_id: string;
  language: string;
  raw_text: string;
  segments: TranscriptSegment[];
}

// -------------------------------------------------------------
// Notifications Types (Phase 4)
// -------------------------------------------------------------
export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: 'ready_for_review' | 'failed' | 'processing';
  episode_id?: string;
}

// -------------------------------------------------------------
// Analytics Types (Phase 4)
// -------------------------------------------------------------
export interface WeeklyEpisodeData {
  week: string;
  episodes: number;
  clips: number;
}

export interface ApprovalRateData {
  name: string;
  value: number;
  color: string;
}

export interface ProcessingTrendData {
  week: string;
  avg_time_min: number;
}

export interface ContentTypeBreakdown {
  type: string;
  count: number;
}

export interface AnalyticsData {
  episodes_per_week: WeeklyEpisodeData[];
  approval_vs_rejection: ApprovalRateData[];
  avg_processing_time_trend: ProcessingTrendData[];
  content_types_breakdown: ContentTypeBreakdown[];
}

// -------------------------------------------------------------
// UI & Multi-Agent Types
// -------------------------------------------------------------
export interface WeeklyProcessingStat {
  week: string;
  episodes: number;
  clips: number;
}

export type AgentState = 'idle' | 'running' | 'completed' | 'waiting' | 'failed';

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
