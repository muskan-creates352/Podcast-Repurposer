"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchEpisodes, fetchPodcastInsights } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import {
  Brain,
  Sparkles,
  Clock,
  Radio,
  FileText,
  Bookmark,
  Users,
  Copy,
  Check,
  Download,
  RefreshCw,
  Compass,
  Target,
  ArrowRight,
  ListFilter,
  CheckCircle2,
  Share2,
} from "lucide-react";

export default function PodcastInsightsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>("ep_01");
  const [activeSummaryTab, setActiveSummaryTab] = useState<"30s" | "1m" | "detailed">("30s");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [topicSearch, setTopicSearch] = useState<string>("");

  // Fetch episodes for dropdown
  const { data: episodes = [] } = useQuery({
    queryKey: ["episodes"],
    queryFn: fetchEpisodes,
  });

  // Fetch insights for the selected episode
  const {
    data: insights,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["podcastInsights", selectedEpisodeId],
    queryFn: () => fetchPodcastInsights(selectedEpisodeId),
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Copied to clipboard", "success");
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleSeek = (timestamp: string) => {
    // Navigate to episode page with timestamp query
    router.push(`/episodes/${selectedEpisodeId}?seek=${encodeURIComponent(timestamp)}`);
  };

  const handleExportMarkdown = () => {
    if (!insights) return;
    const md = [
      `# ${insights.overview.podcast_title} - Podcast Intelligence Report`,
      `Duration: ${insights.duration} | Generated via Groq AI Pipeline\n`,
      `## Overview`,
      `${insights.overview.explanation}\n`,
      `### Purpose`,
      `${insights.overview.purpose}\n`,
      `### Central Idea`,
      `${insights.overview.central_idea}\n`,
      `## Summary (${activeSummaryTab})`,
      activeSummaryTab === "30s"
        ? insights.summaries.summary_30s
        : activeSummaryTab === "1m"
        ? insights.summaries.summary_1m
        : insights.summaries.summary_detailed,
      `\n## Top Takeaways`,
      ...insights.summaries.five_takeaways.map((t, i) => `${i + 1}. ${t}`),
      `\n## Smart Chapters`,
      ...insights.chapters.map(
        (c) => `### Chapter ${c.chapter_number}: ${c.title} (${c.start_time} - ${c.end_time})\n${c.explanation}`
      ),
      `\n## Key Topics`,
      ...insights.topics.map((tp) => `### [${tp.timestamp}] ${tp.name}\n${tp.explanation}`),
    ].join("\n");

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${insights.overview.podcast_title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-insights.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported markdown report successfully", "success");
  };

  const filteredTopics = (insights?.topics || []).filter(
    (t) =>
      t.name.toLowerCase().includes(topicSearch.toLowerCase()) ||
      t.explanation.toLowerCase().includes(topicSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Episode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Podcast Insights</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Core AI Intelligence
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Understand full 1-hour episodes in 60 seconds with timestamp-grounded intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Episode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Episode Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
            <Radio className="w-4 h-4 text-zinc-400" />
            <select
              value={selectedEpisodeId}
              onChange={(e) => setSelectedEpisodeId(e.target.value)}
              className="bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer pr-2"
            >
              {episodes.length > 0 ? (
                episodes.map((ep) => (
                  <option key={ep.id} value={ep.id} className="bg-white dark:bg-zinc-900">
                    {ep.title} ({ep.duration || "24:10"})
                  </option>
                ))
              ) : (
                <option value="ep_01" className="bg-white dark:bg-zinc-900">
                  Episode 1: Autonomous Multi-Agent Workflows
                </option>
              )}
            </select>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-sm"
            title="Refresh AI Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MD</span>
          </button>

          <button
            onClick={() => {
              if (insights) {
                handleCopy(insights.summaries.summary_1m, "quick-copy-all");
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Insights</span>
          </button>
        </div>
      </div>

      {isLoading || !insights ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Synthesizing podcast intelligence via Groq...
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ======================================================== */}
          {/* SECTION 1: PODCAST AT A GLANCE                          */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                <h2 className="text-lg font-bold tracking-tight">Podcast at a Glance</h2>
              </div>
              <span className="text-xs text-zinc-400">
                Episode runtime: <strong className="text-zinc-200">{insights.duration || "24:10"}</strong>
              </span>
            </div>

            {/* Main Overview Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      What is this episode about?
                    </span>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-snug">
                      {insights.overview.podcast_title}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleCopy(insights.overview.explanation, "overview-exp")}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                    title="Copy Overview"
                  >
                    {copiedKey === "overview-exp" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                  {insights.overview.explanation}
                </p>

                {/* Purpose & Central Idea Split Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                  <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                        Main Purpose
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                        {insights.overview.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                        Central Idea
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                        {insights.overview.central_idea}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subjects Covered Pills */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Subjects Covered
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {insights.overview.subjects_covered.map((subject, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
                      >
                        <Bookmark className="w-3 h-3 text-purple-500" />
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Speakers Identified */}
                {insights.overview.speakers && insights.overview.speakers.length > 0 && (
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/70">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-zinc-400" />
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Speaker Intelligence & Viewpoints
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {insights.overview.speakers.map((speaker, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/80 flex items-start gap-3"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                            {speaker.name.charAt(0)}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                {speaker.name}
                              </h5>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {speaker.role}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic leading-relaxed">
                              &ldquo;{speaker.key_viewpoint}&rdquo;
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: 3-TIER AI SUMMARIES & KEY TAKEAWAYS          */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: 3-Tier Summaries Switcher (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <h2 className="text-lg font-bold tracking-tight">AI Summaries</h2>
                </div>

                {/* Tab Switcher */}
                <div className="p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center gap-1">
                  <button
                    onClick={() => setActiveSummaryTab("30s")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeSummaryTab === "30s"
                        ? "bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    30-Second
                  </button>
                  <button
                    onClick={() => setActiveSummaryTab("1m")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeSummaryTab === "1m"
                        ? "bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    1-Minute
                  </button>
                  <button
                    onClick={() => setActiveSummaryTab("detailed")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeSummaryTab === "detailed"
                        ? "bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Detailed
                  </button>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-lg relative min-h-[220px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      {activeSummaryTab === "30s"
                        ? "Quick Elevator Pitch"
                        : activeSummaryTab === "1m"
                        ? "Executive Brief"
                        : "Comprehensive Analysis"}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {activeSummaryTab === "30s"
                        ? "~50 words"
                        : activeSummaryTab === "1m"
                        ? "~150 words"
                        : "Full breakdown"}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handleCopy(
                        activeSummaryTab === "30s"
                          ? insights.summaries.summary_30s
                          : activeSummaryTab === "1m"
                          ? insights.summaries.summary_1m
                          : insights.summaries.summary_detailed,
                        `summary-${activeSummaryTab}`
                      )
                    }
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Copy Active Summary"
                  >
                    {copiedKey === `summary-${activeSummaryTab}` ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
                  {activeSummaryTab === "30s" && insights.summaries.summary_30s}
                  {activeSummaryTab === "1m" && insights.summaries.summary_1m}
                  {activeSummaryTab === "detailed" && insights.summaries.summary_detailed}
                </div>
              </div>
            </div>

            {/* Right Column: 5 Most Important Takeaways (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-lg font-bold tracking-tight">5 Key Takeaways</h2>
                </div>
                <span className="text-xs text-zinc-400">Non-negotiable insights</span>
              </div>

              <div className="space-y-2.5">
                {insights.summaries.five_takeaways.map((takeaway, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-purple-500/40 transition-all flex items-start gap-3 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      {tIdx + 1}
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed min-w-0 flex-1">
                      {takeaway}
                    </p>
                    <button
                      onClick={() => handleCopy(takeaway, `5t-${tIdx}`)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-100 transition-opacity shrink-0"
                      title="Copy Takeaway"
                    >
                      {copiedKey === `5t-${tIdx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: SMART CHAPTERS & TIMELINE                   */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <h2 className="text-lg font-bold tracking-tight">Smart Chapters</h2>
              </div>
              <span className="text-xs text-zinc-400">
                Click any chapter to seek in audio player
              </span>
            </div>

            {/* Visual Timeline Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Podcast Timeline</span>
                <span>{insights.chapters.length} Chapters Identified</span>
              </div>

              {/* Proportional Segment Bar */}
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-1 p-0.5">
                {insights.chapters.map((ch, idx) => {
                  const colors = [
                    "bg-purple-500",
                    "bg-indigo-500",
                    "bg-violet-500",
                    "bg-sky-500",
                    "bg-emerald-500",
                  ];
                  return (
                    <button
                      key={ch.chapter_number}
                      onClick={() => handleSeek(ch.start_time)}
                      className={`h-full ${colors[idx % colors.length]} hover:opacity-80 transition-opacity rounded-sm relative group`}
                      style={{ flex: Math.max(ch.end_seconds - ch.start_seconds, 60) }}
                      title={`${ch.title} (${ch.start_time} - ${ch.end_time})`}
                    />
                  );
                })}
              </div>

              {/* Chapter Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {insights.chapters.map((ch) => (
                  <div
                    key={ch.chapter_number}
                    className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          Chapter {ch.chapter_number}
                        </span>

                        {/* Interactive Clickable Timestamp */}
                        <button
                          onClick={() => handleSeek(ch.start_time)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20 transition-colors"
                          title="Seek to chapter start"
                        >
                          <Clock className="w-3 h-3" />
                          <span>{ch.start_time} - {ch.end_time}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {ch.title}
                      </h4>

                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {ch.explanation}
                      </p>

                      {ch.key_points && ch.key_points.length > 0 && (
                        <ul className="pt-2 space-y-1">
                          {ch.key_points.map((kp, kIdx) => (
                            <li key={kIdx} className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 shrink-0" />
                              <span>{kp}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 4: MAIN TOPICS DISCUSSED                        */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-purple-500" />
                <h2 className="text-lg font-bold tracking-tight">Main Topics Discussed</h2>
              </div>

              {/* Topic search / filter input */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-purple-500/40 shadow-sm transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Topic Section
                      </span>
                      <button
                        onClick={() => handleSeek(topic.timestamp)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-500/10 hover:text-purple-400 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors"
                        title="Seek in audio player"
                      >
                        <Clock className="w-3 h-3 text-purple-500" />
                        <span>{topic.timestamp}</span>
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                      {topic.name}
                    </h4>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {topic.explanation}
                    </p>

                    {/* Important Points */}
                    {topic.important_points && topic.important_points.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/70 space-y-1.5">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          Key Points:
                        </span>
                        {topic.important_points.map((pt, pIdx) => (
                          <div key={pIdx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                            <span className="text-purple-500 font-bold">•</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Related Segments Preview */}
                  {topic.related_segments && topic.related_segments.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                      {topic.related_segments[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 5: ACTIONABLE KEY TAKEAWAYS                     */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-500" />
                <h2 className="text-lg font-bold tracking-tight">Actionable Lessons & Advice</h2>
              </div>
              <span className="text-xs text-zinc-400">Practical implementation guides</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.takeaways.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleSeek(item.timestamp)}
                        className="text-xs text-zinc-400 hover:text-purple-400 flex items-center gap-1 transition-colors"
                        title="Seek in audio"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{item.timestamp}</span>
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                      {item.lesson}
                    </h4>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300 block mb-1">
                      Practical Advice
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {item.practical_advice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
