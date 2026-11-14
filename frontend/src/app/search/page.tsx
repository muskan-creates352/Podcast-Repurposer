"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Sparkles, Radio, ExternalLink, Filter, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SearchMatch {
  id?: string;
  episode_id: number | string;
  episode_title: string;
  timestamp: string;
  start_time: number;
  end_time: number;
  speaker: string;
  snippet: string;
}

const POPULAR_TAGS = [
  "hallucination control",
  "LangGraph agents",
  "timestamp grounding",
  "vector search",
  "repurposing",
  "monetization",
];

function SearchArchiveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const executeSearch = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(`http://localhost:8000/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        throw new Error("Search failed");
      }
    } catch {
      // Fallback search over sample topics
      setResults([
        {
          episode_id: 1,
          episode_title: "Ep 101: The Future of Multimodal AI Agents",
          timestamp: "01:18 - 01:55",
          start_time: 78.5,
          end_time: 115.0,
          speaker: "Speaker 2 (Sarah - Guest)",
          snippet: "When your pipeline grounds its claims in real audio moments, creators trust the output, and approval velocity jumps 5x.",
        },
        {
          episode_id: 2,
          episode_title: "Ep 102: Architecting Resilient Distributed Pipelines",
          timestamp: "00:42 - 01:18",
          start_time: 42.0,
          end_time: 78.5,
          speaker: "Speaker 1 (Alex - Host)",
          snippet: "Every AI generated clip or blog citation must trace directly back to exact audio timestamps so human editors can verify in 1 click.",
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
    } else {
      // Auto-load initial results so page is never empty
      executeSearch("repurposing");
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      executeSearch(query);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-brand-500" />
          <span>Search Back-Catalog Archive (RAG)</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Perform semantic and keyword search across past episode transcripts, guest quotes, and timestamps.
        </p>
      </div>

      {/* Search Input & Button */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'Where did we discuss timestamp grounding?' or 'repurposing'"
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Suggested Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
        <span className="flex items-center gap-1.5 font-medium text-zinc-500 dark:text-zinc-400">
          <Filter className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
          <span>Popular topics:</span>
        </span>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              executeSearch(tag);
            }}
            className="px-3 py-1.5 rounded-xl bg-zinc-200/80 dark:bg-zinc-800/90 hover:bg-brand-500/15 hover:text-brand-400 dark:hover:bg-brand-500/20 dark:hover:text-brand-300 border border-zinc-300 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-medium transition-all text-[11px] flex items-center gap-1 shadow-sm"
          >
            <span className="text-brand-500 dark:text-brand-400 font-bold">#</span>
            <span>{tag}</span>
          </button>
        ))}
      </div>

      {/* Results View */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            {results.length > 0
              ? `Found ${results.length} matches for "${query}"`
              : isSearching
              ? "Searching archive..."
              : `No matches found for "${query}"`}
          </span>
          <span className="flex items-center gap-1 text-brand-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RAG Transcript Retrieval</span>
          </span>
        </div>

        {results.map((res, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm hover:border-brand-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                  {res.episode_title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-[11px] font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{res.timestamp}</span>
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {res.speaker}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-6 border-l-2 border-brand-500/30 italic">
              &ldquo;{res.snippet}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-400">
                Timestamp: {res.start_time}s - {res.end_time}s
              </span>
              <Link
                href={`/review?episode=${res.episode_id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-400 transition-colors"
              >
                <span>Open in Review Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchArchivePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading search...</div>}>
      <SearchArchiveContent />
    </Suspense>
  );
}
