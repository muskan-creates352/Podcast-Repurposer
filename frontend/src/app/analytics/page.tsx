"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/lib/api";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Clock, 
  Radio, 
  Scissors, 
  CheckCircle2, 
  Layers 
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500">Loading AI Repurposing telemetry & metrics...</p>
      </div>
    );
  }

  // Calculate approval metrics
  const totalReviews = analytics.approval_vs_rejection.reduce((acc, curr) => acc + curr.value, 0);
  const approvedCount = analytics.approval_vs_rejection.find((a) => a.name === "Approved")?.value || 0;
  const approvalRatePercent = totalReviews > 0 ? Math.round((approvedCount / totalReviews) * 100) : 0;

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-500" />
          <span>Multi-Agent Analytics & Studio Performance</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Real-time telemetry measuring throughput, approval ratios, processing latency, and content asset distribution.
        </p>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Total Episodes</span>
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
              28
            </span>
            <span className="text-[11px] font-medium text-emerald-500">
              +14% this month
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">Archived & indexed in vector store</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Viral Clips Scored</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
              142
            </span>
            <span className="text-[11px] font-medium text-emerald-500">
              +28% this month
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">Extracted across all episodes</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Editor Approval Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-500">
              {approvalRatePercent}%
            </span>
            <span className="text-[11px] font-medium text-zinc-400">
              ({approvedCount}/{totalReviews} approved)
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">High ground truth & provenance trust</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Avg Processing Time</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
              3.8 min
            </span>
            <span className="text-[11px] font-medium text-emerald-500">
              -47% vs Wk 1
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">Parallelized LangGraph execution</p>
        </div>
      </div>

      {/* Grid of 4 Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Episodes Processed Per Week (BarChart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-brand-500" />
                <span>Episodes & Clips Per Week</span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Weekly throughput of ingested audio and extracted highlights
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.episodes_per_week} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.3} />
                <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#f4f4f5",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="clips" name="Viral Clips" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="episodes" name="Episodes" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Approval vs Rejection Rate (Pie/Donut Chart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <PieChartIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Approval vs Rejection Ratio</span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Editorial review decisions across all generated clips & formats
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.approval_vs_rejection}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                >
                  {analytics.approval_vs_rejection.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#f4f4f5",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Average Processing Time Trend (AreaChart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
                <span>Average Processing Latency (Minutes)</span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                End-to-end turnaround time from audio upload to review queue
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.avg_processing_time_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.3} />
                <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#f4f4f5",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avg_time_min"
                  name="Avg Processing Time (Min)"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#timeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Content Types Generated Breakdown (BarChart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Content Assets Generated</span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Distribution of output formats across all podcast episodes
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.content_types_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.3} />
                <XAxis dataKey="type" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#f4f4f5",
                  }}
                />
                <Bar dataKey="count" name="Generated Assets" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
