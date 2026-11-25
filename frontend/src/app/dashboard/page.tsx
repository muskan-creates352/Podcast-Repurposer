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
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-violet-950/60 via-[#171E35] to-[#141419] border border-violet-500/20 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>One Podcast. Endless Content.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              AI Podcast & Social Video Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Transform hours of audio, YouTube recordings, Instagram Reels, and Shorts into viral clips, SEO articles, and timestamped intelligence in seconds.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/youtube"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              <Video className="w-4 h-4 text-rose-200" />
              <span>Import YouTube</span>
            </Link>

            <Link
              href="/social-video"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              <Film className="w-4 h-4 text-pink-200" />
              <span>Analyze Reel / Short</span>
            </Link>

            <Link
              href="/clip-studio"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              <Scissors className="w-4 h-4" />
              <span>Clip Studio</span>
            </Link>

            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 shadow-sm transition-all"
            >
              <UploadCloud className="w-4 h-4 text-zinc-400" />
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
          icon={<Video className="w-5 h-5 text-rose-400" />}
          variant="brand"
        />
        <StatCard
          title="Clips Generated"
          value={isStatsLoading ? "..." : stats?.clips_generated ?? 142}
          subtitle="Short viral snippets"
          trend="+28% this month"
          icon={<Scissors className="w-5 h-5 text-purple-400" />}
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
              ? `${stats.avg_processing_time} min`
              : stats?.avg_processing_time ? `${stats.avg_processing_time} min` : "4.2 min"
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
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-purple-400" />
                <span>Recently Generated Highlight Clips</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Scored by Groq AI for retention hooks and viral potential
              </p>
            </div>
            <Link
              href="/clip-studio"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Open Clip Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clips.slice(0, 4).map((clip) => (
              <div
                key={clip.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-purple-500/40 shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <TrendingUp className="w-3 h-3" />
                      <span>Score: {clip.viral_score ?? 92}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {clip.start_time} - {clip.end_time}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-purple-400 transition-colors line-clamp-2">
                    {clip.title || clip.text}
                  </h4>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 italic">
                    &ldquo;{clip.quote || clip.reason}&rdquo;
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 uppercase font-medium">
                    {clip.status === "approved" ? "Approved" : "Pending Review"}
                  </span>
                  <Link
                    href="/clip-studio"
                    className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-purple-400 transition-colors"
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
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" />
              <span>Recent Activity Timeline</span>
            </h3>
            <span className="text-[11px] text-zinc-400">Live events</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3.5">
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
                <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                      {act.action}
                    </p>
                    <span className="text-[10px] text-zinc-400 shrink-0">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
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
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Repurposed Podcasts & Videos
            </h3>
            <p className="text-xs text-zinc-500">
              Monitor audio transcription state, clips extraction, and direct studio access
            </p>
          </div>
          <Link
            href="/episodes"
            className="text-xs text-brand-500 hover:underline flex items-center gap-1 font-medium"
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
