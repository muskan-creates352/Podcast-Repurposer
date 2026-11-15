"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStats,
  fetchEpisodes,
  fetchWeeklyStats,
  fetchAgentStatuses,
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

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      {/* Premium Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-violet-950/40 via-[#121215] to-[#121215] border border-violet-500/20 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>One Podcast. Endless Content.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              AI Podcast & Video Repurposer
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Transform hours of audio and YouTube recordings into viral clips, SEO articles, social threads, and timestamp-grounded takeaways in seconds.
            </p>
          </div>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/youtube"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              <Video className="w-4 h-4 text-rose-300" />
              <span>Import YouTube</span>
            </Link>

            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Media</span>
            </Link>

            <Link
              href="/clip-studio"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/80 shadow-sm transition-all"
            >
              <Scissors className="w-4 h-4 text-brand-400" />
              <span>Clip Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Episodes"
          value={isStatsLoading ? "..." : stats?.total_episodes ?? 28}
          subtitle="Processed & archived"
          trend="+14% this month"
          icon={<Radio className="w-5 h-5" />}
          variant="default"
        />
        <StatCard
          title="Videos Imported"
          value={18}
          subtitle="From YouTube podcasts"
          trend="+8 this week"
          icon={<Video className="w-5 h-5" />}
          variant="brand"
        />
        <StatCard
          title="Clips Generated"
          value={isStatsLoading ? "..." : stats?.clips_generated ?? 142}
          subtitle="Highlight video snippets"
          trend="+28% this month"
          icon={<Scissors className="w-5 h-5" />}
          variant="brand"
        />
        <StatCard
          title="Pending Reviews"
          value={isStatsLoading ? "..." : stats?.pending_reviews ?? 12}
          subtitle="Awaiting creator review"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Avg Turnaround"
          value={isStatsLoading ? "..." : stats?.avg_processing_time ?? "4.2 min"}
          subtitle="End-to-end ASR + AI"
          trend="0.8m faster"
          icon={<Zap className="w-5 h-5" />}
          variant="emerald"
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

      {/* Recent Episodes Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Repurposed Episodes
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
