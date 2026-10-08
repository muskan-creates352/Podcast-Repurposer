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
  CheckSquare,
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
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Creator Dashboard</span>
            <span className="p-1 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold">
              v1.0 MVP
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor episode ingestion, transcription, highlight extraction, and content reviews.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/review"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 hover:border-brand-500 text-zinc-700 dark:text-zinc-200 text-xs font-semibold shadow-sm transition-all"
          >
            <CheckSquare className="w-3.5 h-3.5 text-brand-500" />
            <span>Open Review Queue</span>
            <span className="px-1.5 py-0.2 rounded-full bg-brand-500 text-white text-[10px] font-bold">
              {stats?.pending_reviews ?? 12}
            </span>
          </Link>

          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Episode</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Episodes"
          value={isStatsLoading ? "..." : stats?.total_episodes ?? 28}
          subtitle="Processed & archived"
          trend="+14% this month"
          icon={<Radio className="w-5 h-5" />}
          variant="default"
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
          subtitle="Awaiting creator approval"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Avg Processing Time"
          value={isStatsLoading ? "..." : stats?.avg_processing_time ?? "4.2 min"}
          subtitle="End-to-end ASR + Multi-Agent"
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
      <div>
        <EpisodeTable episodes={episodes} />
      </div>
    </div>
  );
}
