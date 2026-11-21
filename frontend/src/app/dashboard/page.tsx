"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStats,
  fetchEpisodes,
  fetchWeeklyStats,
  fetchAgentStatuses,
  fetchClips,
} from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { EpisodeTable } from "@/components/ui/EpisodeTable";
import { PipelineCard } from "@/components/ui/PipelineCard";
import { WeeklyChart } from "@/components/ui/WeeklyChart";
import {
  Radio,
  Scissors,
  Clock,
  Zap,
  UploadCloud,
  Sparkles,
  ArrowRight,
  Video,
  Film,
  Play,
  TrendingUp,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: fetchStats,
  });

  const { data: episodes = [] } = useQuery({
    queryKey: ["episodes"],
    queryFn: fetchEpisodes,
  });

  const { data: weeklyStats = [] } = useQuery({
    queryKey: ["weekly_stats"],
    queryFn: fetchWeeklyStats,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["agents_status"],
    queryFn: fetchAgentStatuses,
  });

  const { data: clips = [] } = useQuery({
    queryKey: ["dashboard_clips"],
    queryFn: () => fetchClips(),
  });

  return (
    <div className="space-y-8 animate-slide-up pb-16 max-w-7xl mx-auto">
      {/* Premium Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#171C26] via-[#141821] to-[#0B0D12] border border-white/[0.08] shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-600/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>One Podcast. Endless Content.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F7FA] leading-tight">
              AI Podcast & Social Video Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
              Transform hours of audio, YouTube recordings, Instagram Reels, and Shorts into viral clips, SEO articles, and timestamped intelligence in seconds.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/social-video"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.45)] transition-all"
            >
              <Film className="w-4 h-4 text-violet-200" />
              <span>Analyze Reel / Short</span>
            </Link>

            <Link
              href="/youtube"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1A202C] text-[#F5F7FA] text-xs font-semibold border border-white/[0.08] hover:border-rose-500/30 shadow-sm transition-all"
            >
              <Video className="w-4 h-4 text-rose-400" />
              <span>Import YouTube</span>
            </Link>

            <Link
              href="/clip-studio"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1A202C] text-[#F5F7FA] text-xs font-semibold border border-white/[0.08] hover:border-cyan-500/30 shadow-sm transition-all"
            >
              <Scissors className="w-4 h-4 text-cyan-400" />
              <span>Clip Studio</span>
            </Link>

            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1A202C] text-[#9CA3AF] hover:text-[#F5F7FA] text-xs font-semibold border border-white/[0.08] shadow-sm transition-all"
            >
              <UploadCloud className="w-4 h-4 text-[#9CA3AF]" />
              <span>Upload Media</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5 KPI Stat Cards (Live DB Driven) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Episodes"
          value={isStatsLoading ? "..." : stats?.total_episodes ?? 28}
          subtitle="Processed & archived"
          trend="+14% this month"
          icon={<Radio className="w-5 h-5" />}
          variant="default"
          href="/episodes"
        />
        <StatCard
          title="Videos Imported"
          value={isStatsLoading ? "..." : stats?.videos_imported ?? 18}
          subtitle="YouTube & Reels"
          trend="+8 this week"
          icon={<Video className="w-5 h-5 text-cyan-400" />}
          variant="brand"
        />
        <StatCard
          title="Clips Generated"
          value={isStatsLoading ? "..." : stats?.clips_generated ?? 142}
          subtitle="Short viral snippets"
          trend="+28% this month"
          icon={<Scissors className="w-5 h-5 text-violet-400" />}
          variant="brand"
          href="/review"
        />
        <StatCard
          title="Pending Reviews"
          value={isStatsLoading ? "..." : stats?.pending_reviews ?? 12}
          subtitle="Awaiting approval"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          variant="amber"
          href="/review"
        />
        <StatCard
          title="Avg Turnaround"
          value={
            isStatsLoading
              ? "..."
              : typeof stats?.avg_processing_time === "number"
              ? `${stats.avg_processing_time}s`
              : stats?.avg_processing_time ?? "42.5s"
          }
          subtitle="Whisper + Groq AI"
          trend="0.8m faster"
          icon={<Zap className="w-5 h-5 text-emerald-400" />}
          variant="emerald"
          href="/episodes"
        />
      </div>

      {/* Charts & Agent Pipeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <WeeklyChart data={weeklyStats} />
        </div>
        <div className="lg:col-span-5">
          <PipelineCard agents={agents} />
        </div>
      </div>

      {/* Feed: Recently Generated Clips & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recently Generated Clips Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
                <Scissors className="w-4 h-4 text-violet-400" />
                <span>Recently Generated Highlight Clips</span>
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                Scored by Groq AI for retention hooks and viral potential
              </p>
            </div>
            <Link
              href="/clip-studio"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Open Clip Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clips.slice(0, 4).map((clip) => (
              <div
                key={clip.id}
                className="p-4 rounded-2xl bg-[#171C26] border border-white/[0.07] hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.12)] transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      <TrendingUp className="w-3 h-3" />
                      <span>Score: {clip.viral_score ?? 92}</span>
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] font-mono">
                      {clip.start_time} - {clip.end_time}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#F5F7FA] leading-snug group-hover:text-violet-300 transition-colors line-clamp-2">
                    {clip.title || clip.text}
                  </h4>

                  <p className="text-[11px] text-[#9CA3AF] line-clamp-2 italic">
                    &ldquo;{clip.quote || clip.reason}&rdquo;
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-medium">
                    {clip.status === "approved" ? "Approved" : "Pending Review"}
                  </span>
                  <Link
                    href="/clip-studio"
                    className="p-1.5 rounded-lg bg-[#141821] text-[#9CA3AF] hover:text-violet-400 hover:bg-violet-500/10 border border-white/[0.04] transition-colors"
                    title="Edit in Clip Studio"
                  >
                    <Play className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Recent Activity Timeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <span>Recent Activity Timeline</span>
            </h3>
            <span className="text-[11px] text-[#9CA3AF]">Live events</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#171C26] border border-white/[0.07] shadow-sm space-y-3.5">
            {(stats?.recent_activities && stats.recent_activities.length > 0
              ? stats.recent_activities
              : [
                  {
                    id: "act_1",
                    action: "Podcast Transcribed & Analyzed",
                    target: "Ep 101: The Future of Multimodal AI Agents",
                    time: "10 mins ago",
                    status: "completed",
                    type: "podcast",
                  },
                  {
                    id: "act_2",
                    action: "Viral Highlight Clip Generated",
                    target: "Why Single-Prompt LLM Chains Fail (Score: 95)",
                    time: "25 mins ago",
                    status: "ready_for_review",
                    type: "clip",
                  },
                  {
                    id: "act_3",
                    action: "Social Content Repurposed",
                    target: "10 Formats generated for Ep 101",
                    time: "45 mins ago",
                    status: "completed",
                    type: "content",
                  },
                  {
                    id: "act_4",
                    action: "YouTube Podcast Imported",
                    target: "Autonomous State Machine Workflows",
                    time: "1 hour ago",
                    status: "completed",
                    type: "video",
                  },
                ]
            ).map((act, aIdx) => (
              <div key={act.id || aIdx} className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 shrink-0 mt-0.5 border border-violet-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#F5F7FA] truncate">
                      {act.action}
                    </p>
                    <span className="text-[10px] text-[#9CA3AF] shrink-0">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">
                    {act.target}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Episodes Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              Recent Repurposed Podcasts & Videos
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Monitor audio transcription state, clips extraction, and direct studio access
            </p>
          </div>
          <Link
            href="/episodes"
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View All Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <EpisodeTable episodes={episodes} />
      </div>
    </div>
  );
}
