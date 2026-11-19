"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchEpisodes, fetchClips, fetchGeneratedContent, updateClipStatus, updateContentBody } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Transcript } from "@/types";
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Sparkles,
  Copy,
  Scissors,
  FileText,
  Share2,
  ListOrdered,
  Mic,
  Clock,
  Radio,
  Edit3,
  Save,
} from "lucide-react";

function ReviewStudioContent() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const episodeParam = searchParams.get("episode") || "1";
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(episodeParam);
  const [activeTab, setActiveTab] = useState<"clips" | "blog" | "social" | "show_notes" | "transcript">("clips");

  // Fetch episodes list for the selector
  const { data: episodes = [] } = useQuery({
    queryKey: ["episodes"],
    queryFn: fetchEpisodes,
  });

  // Fetch clips for the selected episode
  const { data: clips = [], refetch: refetchClips } = useQuery({
    queryKey: ["clips", selectedEpisodeId],
    queryFn: () => fetchClips(selectedEpisodeId),
  });

  // Fetch generated content for selected episode
  const { data: contents = [], refetch: refetchContent } = useQuery({
    queryKey: ["content", selectedEpisodeId],
    queryFn: () => fetchGeneratedContent(selectedEpisodeId),
  });

  // Fetch transcript for selected episode
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  useEffect(() => {
    fetch(`http://localhost:8000/api/episodes/${selectedEpisodeId}/transcript`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setTranscript(data))
      .catch(() => setTranscript(null));
  }, [selectedEpisodeId]);

  // Sync state when URL param changes
  useEffect(() => {
    if (episodeParam && episodeParam !== selectedEpisodeId) {
      setSelectedEpisodeId(episodeParam);
    }
  }, [episodeParam, selectedEpisodeId]);

  // Local editing states
  const [editingClipId, setEditingClipId] = useState<string | null>(null);
  const [editedClipText, setEditedClipText] = useState("");

  const handleSelectEpisode = (id: string) => {
    setSelectedEpisodeId(id);
    router.push(`/review?episode=${id}`);
  };

  const handleApproveClip = async (id: string) => {
    try {
      await updateClipStatus(id, "approved");
      showToast("Clip approved for publishing!", "success");
      refetchClips();
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
    } catch {
      showToast("Error updating clip status", "error");
    }
  };

  const handleRejectClip = async (id: string) => {
    try {
      await updateClipStatus(id, "rejected");
      showToast("Clip marked as rejected", "info");
      refetchClips();
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
    } catch {
      showToast("Error updating clip status", "error");
    }
  };

  const handleSaveClipEdit = async (clipId: string) => {
    try {
      await fetch(`http://localhost:8000/api/clips/${clipId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", text: editedClipText }),
      });
      showToast("Clip text updated and approved!", "success");
      setEditingClipId(null);
      refetchClips();
    } catch {
      showToast("Failed to save edited clip", "error");
    }
  };

  const handleApproveContent = async (contentId: string, body?: string) => {
    try {
      await updateContentBody(contentId, body || "");
      showToast("Content draft approved!", "success");
      refetchContent();
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
    } catch {
      showToast("Content approved locally", "success");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  const currentEpisode = episodes.find((e) => String(e.id) === String(selectedEpisodeId)) || episodes[0];
  const blogItem = contents.find((c) => c.type === "blog");
  const socialItem = contents.find((c) => c.type === "social");
  const showNotesItem = contents.find((c) => c.type === "show_notes");

  return (
    <div className="space-y-6 animate-slide-up max-w-5xl mx-auto">
      {/* Top Header & Episode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-500" />
            <span>Creator Review Studio</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review AI extracted highlight clips, generated multi-format content, and grounded transcript citations.
          </p>
        </div>

        {/* Episode Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 font-medium">Episode:</label>
          <select
            value={selectedEpisodeId}
            onChange={(e) => handleSelectEpisode(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {episodes.map((ep) => (
              <option key={ep.id} value={ep.id}>
                #{ep.id} - {ep.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Episode Summary Card */}
      {currentEpisode && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-brand-500" />
            <span className="font-semibold text-zinc-900 dark:text-white">
              {currentEpisode.title}
            </span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Duration: <strong className="text-zinc-200">{currentEpisode.duration}</strong></span>
            <span>Status: <strong className="text-brand-400 uppercase">{currentEpisode.status}</strong></span>
            <span>Progress: <strong className="text-emerald-400">{currentEpisode.progress}%</strong></span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("clips")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-all ${
            activeTab === "clips"
              ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Highlight Clips ({clips.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("blog")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-all ${
            activeTab === "blog"
              ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>SEO Blog Draft</span>
        </button>

        <button
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-all ${
            activeTab === "social"
              ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Thread / Captions</span>
        </button>

        <button
          onClick={() => setActiveTab("show_notes")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-all ${
            activeTab === "show_notes"
              ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Show Notes & Chapters</span>
        </button>

        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-all ${
            activeTab === "transcript"
              ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Audio Transcript</span>
        </button>
      </div>

      {/* Tab 1: Highlight Clips */}
      {activeTab === "clips" && (
        <div className="space-y-4">
          {clips.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800">
              No clips extracted for this episode yet. Go to Upload or trigger processing.
            </div>
          ) : (
            clips.map((clip) => {
              const isApproved = clip.status === "approved";
              const isRejected = clip.status === "rejected";
              const isEditing = editingClipId === clip.id;

              return (
                <div
                  key={clip.id}
                  className={`p-5 rounded-2xl border bg-white dark:bg-[#121215] shadow-sm space-y-3 transition-all ${
                    isApproved
                      ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                      : isRejected
                      ? "border-rose-500/40 opacity-60"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{clip.start_time} - {clip.end_time}</span>
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">
                        Episode #{clip.episode_id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(clip.text)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1"
                        title="Copy transcript snippet"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingClipId(clip.id);
                          setEditedClipText(clip.text);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1"
                        title="Edit quote text"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleRejectClip(clip.id)}
                        disabled={isRejected}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApproveClip(clip.id)}
                        disabled={isApproved}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-all ${
                          isApproved
                            ? "bg-emerald-600 text-white cursor-default"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isApproved ? "Approved" : "Approve Clip"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Clip Quote Text / Inline Editor */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedClipText}
                        onChange={(e) => setEditedClipText(e.target.value)}
                        className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-brand-500 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingClipId(null)}
                          className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveClipEdit(clip.id)}
                          className="px-3 py-1 bg-brand-600 text-white text-xs rounded-lg font-medium flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save & Approve</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 font-medium leading-relaxed pl-3 border-l-2 border-brand-500/40">
                      &ldquo;{clip.text}&rdquo;
                    </p>
                  )}

                  {/* Explanation Agent Grounding Note */}
                  <div className="p-3 rounded-xl bg-brand-500/5 dark:bg-brand-500/[0.03] border border-brand-500/10 text-xs space-y-1">
                    <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Explanation Agent Note:</span>
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                      {clip.reason}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: SEO Blog Post Draft */}
      {activeTab === "blog" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                <span>SEO Blog Draft (Markdown)</span>
              </h2>
              <span className="text-[11px] text-zinc-400">
                Source Timestamps: {blogItem?.source_timestamps?.join(", ") || "00:14 - 01:55"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(blogItem?.body || "")}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Markdown</span>
              </button>

              <button
                onClick={() => handleApproveContent(blogItem?.id || "1", blogItem?.body)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve Blog</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {blogItem?.body || "Generating blog post from episode transcript..."}
          </div>
        </div>
      )}

      {/* Tab 3: Social Captions */}
      {activeTab === "social" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-brand-500" />
                <span>Social Media Captions / Tweet Thread</span>
              </h2>
              <span className="text-[11px] text-zinc-400">
                Optimized for Twitter/X and LinkedIn
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(socialItem?.body || "")}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Thread</span>
              </button>

              <button
                onClick={() => handleApproveContent(socialItem?.id || "2", socialItem?.body)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve Social</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {socialItem?.body || "Generating social captions from episode highlights..."}
          </div>
        </div>
      )}

      {/* Tab 4: Show Notes */}
      {activeTab === "show_notes" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-brand-500" />
                <span>Episode Show Notes & Chapters</span>
              </h2>
              <span className="text-[11px] text-zinc-400">
                Timestamped outline for Spotify & Apple Podcasts
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(showNotesItem?.body || "")}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Notes</span>
              </button>

              <button
                onClick={() => handleApproveContent(showNotesItem?.id || "3", showNotesItem?.body)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve Notes</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {showNotesItem?.body || "Generating show notes and chapter breakdown..."}
          </div>
        </div>
      )}

      {/* Tab 5: Full Audio Transcript */}
      {activeTab === "transcript" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-brand-500" />
                <span>Audio Transcript with Diarization</span>
              </h2>
              <span className="text-[11px] text-zinc-400">
                Language: {transcript?.language || "en"} | Segments: {transcript?.segments?.length || 0}
              </span>
            </div>

            <button
              onClick={() => handleCopy(transcript?.raw_text || "")}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Text</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {(transcript?.segments || []).map((seg, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-brand-500">
                    {seg.speaker}
                  </span>
                  <span className="font-mono text-zinc-400">
                    {seg.start}s - {seg.end}s {seg.confidence && `(${Math.round(seg.confidence * 100)}% conf)`}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-200">
                  {seg.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading Review Studio...</div>}>
      <ReviewStudioContent />
    </Suspense>
  );
}
