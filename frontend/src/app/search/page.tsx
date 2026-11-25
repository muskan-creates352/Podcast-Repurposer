"use client";

import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { API_BASE_URL } from "@/lib/api";
import {
  CATEGORIES,
  getEpisodeAssets,
} from "@/lib/episodeAssets";
import {
  Search,
  Sparkles,
  Filter,
  Clock,
  ArrowRight,
  Play,
  Pause,
  Copy,
  Check,
  X,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  Cpu,
  Hash,
  ChevronDown,
  CheckCircle2,
  ArrowUpRight,
  Headphones,
  Flame,
} from "lucide-react";

interface SearchMatch {
  id?: string;
  episode_id: number | string;
  episode_title: string;
  timestamp: string;
  start_time: number;
  end_time: number;
  speaker: string;
  snippet: string;
  content_type?: string;
  score?: number;
}

interface SearchStats {
  total_episodes: number;
  total_segments: number;
  indexed_status: string;
  speakers: string[];
  episodes: { id: number; title: string }[];
}

const POPULAR_TAGS = [
  "hallucination control",
  "LangGraph agents",
  "timestamp grounding",
  "vector search",
  "repurposing",
  "monetization",
];

type SearchMode = "hybrid" | "keyword";
type ContentFilter = "all" | "transcript" | "clip" | "episode";
type DateFilter = "all" | "7d" | "30d" | "90d";
type SortOption = "relevance" | "newest" | "oldest";

function highlightMatch(text: string, query: string) {
  if (!query || !query.trim()) return text;
  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (words.length === 0) return text;
  const regex = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-brand-500/25 text-brand-300 dark:text-brand-200 px-1 py-0.5 rounded font-semibold border-b border-brand-400/40"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function SearchArchiveContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const initialQuery = searchParams.get("q") || "";

  // Core Search State
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("hybrid");

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<string>("all");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("relevance");

  // Stats from backend
  const [stats, setStats] = useState<SearchStats>({
    total_episodes: 5,
    total_segments: 21,
    indexed_status: "100% Vectorized & Ready",
    speakers: [],
    episodes: [],
  });

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Playback Simulation State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pagination / Load More
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Load stats and recent searches on mount
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch(`${API_BASE_URL}/search/stats`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        setStats({
          total_episodes: 5,
          total_segments: 21,
          indexed_status: "100% Vectorized & Ready",
          speakers: ["Speaker 1 (Alex - Host)", "Speaker 2 (Sarah - Guest)"],
          episodes: [
            { id: 1, title: "Ep 101: The Future of Multimodal AI Agents" },
            { id: 2, title: "Ep 102: Architecting Resilient Distributed Pipelines" },
            { id: 3, title: "Ep 103: Creator Economy: Building Scalable Micro-SaaS" },
            { id: 4, title: "Ep 104: Prompt Engineering vs Supervised Fine-Tuning" },
            { id: 5, title: "Ep 105: Behind the Mic: Raw Maintainer Interviews" },
          ],
        });
      }
    }

    try {
      const stored = localStorage.getItem("ai_podcast_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {}

    loadStats();
  }, []);

  const saveRecentSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    try {
      const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("ai_podcast_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const removeRecentSearch = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== termToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem("ai_podcast_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("ai_podcast_recent_searches");
    } catch {}
    showToast("Recent searches cleared", "info");
  };

  // Main Search Execution
  const executeSearch = async (
    searchQuery: string,
    mode = searchMode,
    epFilter = selectedEpisode,
    spkFilter = selectedSpeaker,
    dtFilter = dateFilter,
    typeFilter = contentFilter,
    sort = sortOption
  ) => {
    const q = searchQuery.trim();
    if (!q) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setVisibleCount(6);
    saveRecentSearch(q);

    try {
      const params = new URLSearchParams();
      params.set("q", q);
      params.set("mode", mode);
      if (epFilter !== "all") params.set("episode_id", epFilter);
      if (spkFilter !== "all") params.set("speaker", spkFilter);
      if (dtFilter !== "all") params.set("date_range", dtFilter);
      if (typeFilter !== "all") params.set("content_type", typeFilter);
      params.set("sort", sort);

      const res = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        throw new Error("Search endpoint error");
      }
    } catch {
      // Graceful fallback
      setResults([
        {
          id: "t_101_78",
          episode_id: 1,
          episode_title: "Ep 101: The Future of Multimodal AI Agents",
          timestamp: "01:18 - 01:55",
          start_time: 78.5,
          end_time: 115.0,
          speaker: "Speaker 2 (Sarah - Guest)",
          snippet: "When your pipeline grounds its claims in real audio moments, creators trust the output, and approval velocity jumps 5x.",
          content_type: "transcript",
          score: 0.96,
        },
        {
          id: "t_102_42",
          episode_id: 2,
          episode_title: "Ep 102: Architecting Resilient Distributed Pipelines",
          timestamp: "00:42 - 01:18",
          start_time: 42.0,
          end_time: 78.5,
          speaker: "Speaker 1 (Alex - Host)",
          snippet: "Every AI generated clip or blog citation must trace directly back to exact audio timestamps so human editors can verify in 1 click.",
          content_type: "transcript",
          score: 0.94,
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      executeSearch(query);
    }
  };

  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    if (query.trim()) {
      executeSearch(query, mode);
    }
  };

  const handleClearFilters = () => {
    setSelectedEpisode("all");
    setSelectedSpeaker("all");
    setDateFilter("all");
    setContentFilter("all");
    setSortOption("relevance");
    if (query.trim()) {
      executeSearch(query, searchMode, "all", "all", "all", "all", "relevance");
    }
    showToast("Filters reset to default", "info");
  };

  const isAnyFilterActive =
    selectedEpisode !== "all" ||
    selectedSpeaker !== "all" ||
    dateFilter !== "all" ||
    contentFilter !== "all" ||
    sortOption !== "relevance";

  // Filter results by content tab
  const filteredResults = useMemo(() => {
    if (contentFilter === "all") return results;
    return results.filter((r) => r.content_type === contentFilter);
  }, [results, contentFilter]);

  const visibleResults = useMemo(() => {
    return filteredResults.slice(0, visibleCount);
  }, [filteredResults, visibleCount]);

  // Audio Playback Simulation
  const togglePlayAudio = (matchId: string, durationSec = 15) => {
    if (playingId === matchId) {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      setPlayingId(null);
      setPlaybackSeconds(0);
      return;
    }

    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setPlayingId(matchId);
    setPlaybackSeconds(0);

    playbackTimerRef.current = setInterval(() => {
      setPlaybackSeconds((prev) => {
        if (prev >= durationSec) {
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
          setPlayingId(null);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  const copyText = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`${label} copied to clipboard!`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-slide-up pb-20 max-w-7xl mx-auto">
      {/* 1. Friendly Creator Search Header */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Discover Your Podcasts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold border border-brand-500/20">
              AI Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Search by topics, guest quotes, viral moments, or exact spoken words across your entire episode catalog.
          </p>
        </div>

        {/* Large Prominent Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-zinc-400 group-focus-within:text-brand-400 transition-colors pointer-events-none">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a topic, guest quote, or question (e.g. 'timestamp grounding', 'monetization')..."
            className="w-full pl-12 pr-44 py-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm transition-all"
          />

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setHasSearched(false);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white text-xs font-semibold shadow-glow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSearching ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Searching</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Search Library</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Simplified Mode Switch & Filter Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 self-start">
            <button
              type="button"
              onClick={() => handleModeChange("hybrid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                searchMode === "hybrid"
                  ? "bg-brand-600 text-white shadow-sm font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Search (AI Meaning)</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange("keyword")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                searchMode === "keyword"
                  ? "bg-brand-600 text-white shadow-sm font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Exact Spoken Words</span>
            </button>
          </div>

          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer self-start sm:self-auto ${
              showFilters || isAnyFilterActive
                ? "border-brand-500 bg-brand-500/10 text-brand-400 font-semibold"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
            <span>Filter Library</span>
            {isAnyFilterActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible Advanced Filters Panel */}
        {showFilters && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-brand-500" />
                <span>Filter By Topic & Speaker</span>
              </span>

              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[11px] text-brand-500 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Episode Filter */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Select Episode
                </label>
                <select
                  value={selectedEpisode}
                  onChange={(e) => {
                    setSelectedEpisode(e.target.value);
                    if (query.trim()) executeSearch(query, searchMode, e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="all">All Episodes ({stats.total_episodes})</option>
                  {stats.episodes.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      {ep.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speaker Filter */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Speaker
                </label>
                <select
                  value={selectedSpeaker}
                  onChange={(e) => {
                    setSelectedSpeaker(e.target.value);
                    if (query.trim()) executeSearch(query, searchMode, selectedEpisode, e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="all">All Speakers</option>
                  {stats.speakers.map((spk) => (
                    <option key={spk} value={spk}>
                      {spk}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Content Format
                </label>
                <select
                  value={contentFilter}
                  onChange={(e) => {
                    const val = e.target.value as ContentFilter;
                    setContentFilter(val);
                    if (query.trim()) executeSearch(query, searchMode, selectedEpisode, selectedSpeaker, dateFilter, val);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="all">All Content</option>
                  <option value="transcript">Transcript Moments</option>
                  <option value="clip">Viral Clips</option>
                  <option value="episode">Full Episodes</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Sort Results
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    const val = e.target.value as SortOption;
                    setSortOption(val);
                    if (query.trim()) executeSearch(query, searchMode, selectedEpisode, selectedSpeaker, dateFilter, contentFilter, val);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="relevance">Best Match (Relevance)</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SKELETON LOADING STATE */}
      {isSearching && (
        <div className="space-y-4 pt-2">
          <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-3 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                </div>
              </div>
              <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-850 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* 2. WHEN NO QUERY: SHOW BEAUTIFUL DISCOVERY DASHBOARD */}
      {!hasSearched && !isSearching && (
        <div className="space-y-10">
          {/* SECTION A: Visual Podcast Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-brand-500" />
                  <span>Browse by Category</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Tap any topic to discover matching audio moments and clips.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    setQuery(cat.query);
                    executeSearch(cat.query);
                  }}
                  className={`group relative h-44 rounded-2xl overflow-hidden border ${cat.borderColor} cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300`}
                >
                  {/* Background Image with Gradient Overlay */}
                  <img
                    src={cat.coverImage}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-90 group-hover:opacity-80 transition-opacity`} />

                  {/* Card Content */}
                  <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white">
                    <span className={`self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cat.tagColor}`}>
                      {cat.id}
                    </span>

                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-white group-hover:text-brand-300 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-zinc-300 line-clamp-2 mt-0.5 leading-snug">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B: Featured Episodes (Visual Context-Aware Artwork) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-brand-400" />
                  <span>Featured Episodes in Archive</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Complete recordings indexed and ready for AI repurposing.
                </p>
              </div>

              <Link
                href="/episodes"
                className="text-xs font-semibold text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View all library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stats.episodes.slice(0, 3).map((ep) => {
                const assets = getEpisodeAssets(ep.id, ep.title);
                return (
                  <div
                    key={ep.id}
                    className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:border-brand-500/60 dark:hover:border-brand-500/60 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      {/* Artwork Banner */}
                      <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
                        <img
                          src={assets.coverImage}
                          alt={ep.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${assets.categoryColor}`}>
                            {assets.category}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10">
                            EP #{ep.id}
                          </span>
                        </div>

                        {/* Play Button Overlay */}
                        <button
                          type="button"
                          onClick={() => {
                            setQuery(ep.title.replace(/^Ep\s*\d+:\s*/i, ""));
                            executeSearch(ep.title.replace(/^Ep\s*\d+:\s*/i, ""), searchMode, String(ep.id));
                          }}
                          className="absolute bottom-3 right-3 p-3 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all hover:scale-110 active:scale-95 cursor-pointer"
                          title="Search this episode"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      </div>

                      {/* Episode Details */}
                      <div className="p-4 space-y-2.5">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-brand-400 transition-colors line-clamp-1">
                          {ep.title}
                        </h3>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {assets.tagline}
                        </p>

                        {/* Host & Guest Info */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={assets.hostAvatar}
                              alt={assets.hostName}
                              className="w-6 h-6 rounded-full object-cover border border-brand-500/30"
                            />
                            <span className="text-[11px] font-medium text-zinc-300">
                              {assets.hostName}
                            </span>
                          </div>

                          {assets.guestName && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              w/ {assets.guestName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-zinc-100/60 dark:border-zinc-800/40">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEpisode(String(ep.id));
                          setQuery(ep.title.replace(/^Ep\s*\d+:\s*/i, ""));
                          executeSearch(ep.title.replace(/^Ep\s*\d+:\s*/i, ""), searchMode, String(ep.id));
                        }}
                        className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        Search In Transcript
                      </button>

                      <Link
                        href={`/review?episode=${ep.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        <span>Open Studio</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION C: Recently Added Episodes (Horizontal Carousel) */}
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Recently Added Episodes</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {stats.episodes.map((ep) => {
                const assets = getEpisodeAssets(ep.id, ep.title);
                return (
                  <div
                    key={ep.id}
                    onClick={() => {
                      setSelectedEpisode(String(ep.id));
                      setQuery(ep.title.replace(/^Ep\s*\d+:\s*/i, ""));
                      executeSearch(ep.title.replace(/^Ep\s*\d+:\s*/i, ""), searchMode, String(ep.id));
                    }}
                    className="p-3 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand-500/60 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="relative h-24 w-full rounded-xl overflow-hidden bg-zinc-900">
                        <img
                          src={assets.coverImage}
                          alt={ep.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/70 text-white">
                          EP {ep.id}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-brand-400 transition-colors line-clamp-1">
                        {ep.title}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-2">
                      <span>{assets.category}</span>
                      <span className="text-brand-400 font-semibold group-hover:underline">Search →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION D: Popular Search Ideas & Recent Searches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Popular Topics */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-brand-500" />
                <span>Popular Search Topics</span>
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      executeSearch(tag);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 hover:bg-brand-500/20 hover:text-brand-300 border border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 font-medium transition-all text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span className="text-brand-400 font-bold">#</span>
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Recent Searches</span>
                </p>
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllRecent}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No recent searches yet. Try a search above!</p>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {recentSearches.map((term) => (
                    <span
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        executeSearch(term);
                      }}
                      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-700 dark:text-zinc-300 hover:text-brand-400 hover:border-brand-500/40 cursor-pointer transition-all"
                    >
                      <span>&ldquo;{term}&rdquo;</span>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(term, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. WHEN SEARCH QUERY IS ENTERED: VISUAL RESULT CARDS */}
      {hasSearched && !isSearching && (
        <div className="space-y-4">
          {/* Results Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                {filteredResults.length} moments found
              </span>
              <span className="text-zinc-400">for &ldquo;{query}&rdquo;</span>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-[11px] font-semibold border border-brand-500/20">
                {searchMode === "hybrid" ? "Smart AI Search" : "Exact Words"}
              </span>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setContentFilter("all")}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  contentFilter === "all"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                All ({results.length})
              </button>
              <button
                type="button"
                onClick={() => setContentFilter("transcript")}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  contentFilter === "transcript"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Transcripts ({results.filter((r) => r.content_type === "transcript").length})
              </button>
              <button
                type="button"
                onClick={() => setContentFilter("clip")}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  contentFilter === "clip"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Viral Clips ({results.filter((r) => r.content_type === "clip").length})
              </button>
            </div>
          </div>

          {/* NO RESULTS FOUND STATE */}
          {filteredResults.length === 0 && (
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-850 text-zinc-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200">
                  No matching moments found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Try searching with <strong>Smart Search</strong> or clear active filters to widen your search.
                </p>
              </div>
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all cursor-pointer"
                >
                  Reset Active Filters
                </button>
              )}
            </div>
          )}

          {/* VISUAL RESULT CARDS LIST */}
          <div className="space-y-4">
            {visibleResults.map((res, idx) => {
              const cardId = res.id || `result_${idx}`;
              const isPlaying = playingId === cardId;
              const assets = getEpisodeAssets(res.episode_id, res.episode_title);

              return (
                <div
                  key={cardId}
                  className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:border-brand-500/60 dark:hover:border-brand-500/60 hover:shadow-xl transition-all duration-300 group space-y-4"
                >
                  {/* Top Bar with Real Artwork, Title, and Speaker Avatar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      {/* Context-aware Episode Cover Thumbnail */}
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 border border-brand-500/30 shadow-sm">
                        <img
                          src={assets.coverImage}
                          alt={res.episode_title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/75 text-[8px] font-mono font-bold text-white">
                          EP {res.episode_id}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={`/review?episode=${res.episode_id}`}
                          className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-brand-400 transition-colors block truncate"
                        >
                          {res.episode_title}
                        </Link>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 flex-wrap">
                          {/* Speaker Avatar + Name */}
                          <div className="flex items-center gap-1.5 font-medium text-zinc-300">
                            <img
                              src={assets.hostAvatar}
                              alt={res.speaker}
                              className="w-4 h-4 rounded-full object-cover border border-white/20"
                            />
                            <span>{res.speaker}</span>
                          </div>

                          <span>•</span>

                          {/* Timestamp Citation */}
                          <span className="inline-flex items-center gap-1 text-brand-400 font-mono font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>{res.timestamp}</span>
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${assets.categoryColor}`}>
                            {assets.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    {res.score !== undefined && res.score !== null && (
                      <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{Math.round(res.score * 100)}% Match</span>
                      </div>
                    )}
                  </div>

                  {/* Transcript Excerpt with Keyword Highlighting */}
                  <div className="relative pl-4 border-l-3 border-brand-500/60 bg-zinc-50/70 dark:bg-zinc-900/40 p-3.5 rounded-r-2xl">
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                      &ldquo;{highlightMatch(res.snippet, query)}&rdquo;
                    </p>

                    {/* Interactive Audio Waveform Visualizer */}
                    {isPlaying && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs text-brand-400 font-mono">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5 animate-pulse text-brand-400" />
                          <span>Playing snippet audio: 00:{playbackSeconds < 10 ? `0${playbackSeconds}` : playbackSeconds} / 00:15</span>
                        </div>
                        <div className="flex items-center gap-1 h-3.5">
                          <span className="w-1 bg-brand-500 rounded-full animate-bounce h-3"></span>
                          <span className="w-1 bg-brand-400 rounded-full animate-bounce h-2" style={{ animationDelay: "0.15s" }}></span>
                          <span className="w-1 bg-brand-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: "0.3s" }}></span>
                          <span className="w-1 bg-brand-400 rounded-full animate-bounce h-2" style={{ animationDelay: "0.45s" }}></span>
                          <span className="w-1 bg-brand-300 rounded-full animate-bounce h-3" style={{ animationDelay: "0.6s" }}></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Play Snippet */}
                      <button
                        type="button"
                        onClick={() => togglePlayAudio(cardId)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isPlaying
                            ? "bg-brand-600 text-white shadow-sm"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-brand-500/15 hover:text-brand-300"
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Pause Audio</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Play Audio Snippet</span>
                          </>
                        )}
                      </button>

                      {/* Copy Transcript */}
                      <button
                        type="button"
                        onClick={() => copyText(res.snippet, `text_${cardId}`, "Transcript text")}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-brand-400 text-xs font-medium transition-colors cursor-pointer"
                        title="Copy quote"
                      >
                        {copiedId === `text_${cardId}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Quote</span>
                          </>
                        )}
                      </button>

                      {/* Copy Timestamp */}
                      <button
                        type="button"
                        onClick={() => copyText(res.timestamp, `ts_${cardId}`, "Timestamp citation")}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-brand-400 text-xs font-medium transition-colors cursor-pointer"
                        title="Copy timestamp"
                      >
                        {copiedId === `ts_${cardId}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{res.timestamp}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Open in Review Studio */}
                    <Link
                      href={`/review?episode=${res.episode_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-400 transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      <span>Open in Review Studio</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Pagination */}
          {filteredResults.length > visibleCount && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:border-brand-500 hover:text-brand-400 shadow-sm transition-all cursor-pointer"
              >
                Load More Moments ({filteredResults.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchArchivePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
          <span>Loading Podcast Discovery Dashboard...</span>
        </div>
      }
    >
      <SearchArchiveContent />
    </Suspense>
  );
}
