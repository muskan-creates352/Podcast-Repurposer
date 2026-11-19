"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchEpisode, 
  fetchTranscript, 
  fetchClips, 
  fetchGeneratedContent 
} from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AgentStepper } from "@/components/episodes/AgentStepper";
import { AudioPlayer } from "@/components/episodes/AudioPlayer";
import { TranscriptViewer } from "@/components/episodes/TranscriptViewer";
import { ClipCard } from "@/components/episodes/ClipCard";
import { ContentTab } from "@/components/episodes/ContentTab";
import { parseTimestampToSeconds, formatDate } from "@/lib/utils";
import { 
  Radio, 
  Clock, 
  Calendar, 
  Scissors, 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2 
} from "lucide-react";
import Link from "next/link";

export default function EpisodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "ep_01";

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeStudioTab, setActiveStudioTab] = useState<"clips" | "content">("clips");

  // Real-time polling every 3000ms until status is ready_for_review or published
  const { 
    data: episode, 
    isLoading: isEpisodeLoading,
    isRefetching: isEpisodePolling,
    refetch 
  } = useQuery({
    queryKey: ["episode", id],
    queryFn: () => fetchEpisode(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "ready_for_review" || status === "published") {
        return false; // Stop polling once ready
      }
      return 3000; // Poll every 3 seconds
    },
  });

  const { data: transcript } = useQuery({
    queryKey: ["transcript", id],
    queryFn: () => fetchTranscript(id),
    enabled: !!episode,
  });

  const { data: clips = [] } = useQuery({
    queryKey: ["clips", id],
    queryFn: () => fetchClips(id),
    enabled: !!episode,
  });

  const { data: content = [] } = useQuery({
    queryKey: ["content", id],
    queryFn: () => fetchGeneratedContent(id),
    enabled: !!episode,
  });

  const durationInSeconds = useMemo(() => {
    if (!episode?.duration) return 2895;
    return parseTimestampToSeconds(episode.duration);
  }, [episode?.duration]);

  const handleSeek = (timeInSeconds: number) => {
    setCurrentTime(timeInSeconds);
  };

  if (isEpisodeLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading episode workspace & multi-agent telemetry...
        </p>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="text-center py-16 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Episode Not Found
        </h2>
        <p className="text-xs text-zinc-500">
          The requested episode ID &ldquo;{id}&rdquo; does not exist.
        </p>
        <Link
          href="/episodes"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Episodes</span>
        </Link>
      </div>
    );
  }

  const isFullyProcessed = episode.status === "ready_for_review" || episode.status === "published";

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Link href="/episodes" className="hover:text-brand-500 transition-colors">
            Episodes
          </Link>
          <span>/</span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-xs">
            {episode.id}
          </span>
        </div>

        {/* Polling Indicator */}
        <div className="flex items-center gap-2">
          {isEpisodePolling && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Syncing live agent state (3s)...</span>
            </span>
          )}
          {isFullyProcessed && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pipeline Complete • Ready for Review</span>
            </span>
          )}
        </div>
      </div>

      {/* Episode Header Summary Card */}
      <div className="bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <Radio className="w-5 h-5 text-brand-500 shrink-0" />
              <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {episode.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Duration: {episode.duration}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Uploaded: {formatDate(episode.created_at)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={episode.status} size="md" />
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-brand-500 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Agent Live Stepper */}
      <AgentStepper status={episode.status} progress={episode.progress} />

      {/* Interactive Audio Player with Time Scrubbing & Sync */}
      <AudioPlayer
        episodeTitle={episode.title}
        durationInSeconds={durationInSeconds}
        currentTime={currentTime}
        onTimeUpdate={setCurrentTime}
        onSeek={handleSeek}
      />

      {/* Dual Column Studio Layout: Diarized Transcript vs Repurposed Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Diarized Transcript (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <TranscriptViewer
            segments={transcript?.segments || []}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>

        {/* Right Column: Repurposed Content Studio (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Repurpose Mode Switcher */}
          <div className="bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveStudioTab("clips")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeStudioTab === "clips"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Viral Clips ({clips.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStudioTab("content")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeStudioTab === "content"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Format Text ({content.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-zinc-400 pr-3 hidden sm:inline">
              Click timestamps to seek audio
            </span>
          </div>

          {/* Tab 1: Clips List with "Why this was picked" justification */}
          {activeStudioTab === "clips" && (
            <div className="space-y-4">
              {clips.length === 0 ? (
                <div className="p-12 text-center text-xs text-zinc-400 bg-white dark:bg-[#171E35] rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  Highlight agent is still analyzing transcript segments...
                </div>
              ) : (
                clips.map((clip) => (
                  <ClipCard
                    key={clip.id}
                    clip={clip}
                    onSeek={handleSeek}
                  />
                ))
              )}
            </div>
          )}

          {/* Tab 2: Repurposed Content (Blog, Social, Show Notes) + Export to .md & .txt */}
          {activeStudioTab === "content" && (
            <ContentTab
              contentItems={content}
              onSeek={handleSeek}
            />
          )}
        </div>
      </div>
    </div>
  );
}
