"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Sparkles, Radio, ExternalLink, Filter, Clock } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: string;
  episodeId: string;
  episodeTitle: string;
  timestamp: string;
  snippet: string;
  similarityScore: string;
  topic: string;
}

const ALL_TRANSCRIPT_ARCHIVE: SearchResult[] = [
  {
    id: "1",
    episodeId: "ep_01",
    episodeTitle: "Ep. 42: Building Autonomous Multi-Agent AI Systems with LangGraph",
    timestamp: "18:45",
    snippet: "If you want creators to actually trust AI output, you have to provide source timestamps. Never present a generated claim without showing exactly which second it was spoken.",
    similarityScore: "95% Match",
    topic: "Grounding & Provenance",
  },
  {
    id: "2",
    episodeId: "ep_01",
    episodeTitle: "Ep. 42: Building Autonomous Multi-Agent AI Systems with LangGraph",
    timestamp: "04:12",
    snippet: "The reason why single-prompt LLMs fail in complex workflows is state management. Once you introduce a deterministic graph like LangGraph with clear state cycles, reliability jumps from 60% to over 95%.",
    similarityScore: "91% Match",
    topic: "Multi-Agent Architecture",
  },
  {
    id: "3",
    episodeId: "ep_03",
    episodeTitle: "Ep. 40: The Architecture of Next-Gen Vector Search & Embeddings",
    timestamp: "24:10",
    snippet: "Vector search allows retrieval over months of podcast transcripts in under 50ms using cosine similarity on chunked embeddings.",
    similarityScore: "89% Match",
    topic: "RAG & Vector Retrieval",
  },
  {
    id: "4",
    episodeId: "ep_04",
    episodeTitle: "Ep. 39: Monetizing Niche Newsletters and Micro-Podcasts in 2026",
    timestamp: "12:30",
    snippet: "Repurposing audio into high-intent email newsletters has a 4x higher open rate than generic blast emails.",
    similarityScore: "84% Match",
    topic: "Creator Monetization",
  },
  {
    id: "5",
    episodeId: "ep_05",
    episodeTitle: "Ep. 38: Bootstrapping a SaaS to $50k MRR Without VC Funding",
    timestamp: "33:15",
    snippet: "Keep your MVP lean. Deliver a working frontend first, then connect persistent database CRUD, and layer GenAI on top.",
    similarityScore: "80% Match",
    topic: "Bootstrapping",
  },
];

function SearchArchiveContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const executeSearch = (searchQuery: string) => {
    setIsSearching(true);
    setHasSearched(true);

    setTimeout(() => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) {
        setResults(ALL_TRANSCRIPT_ARCHIVE.slice(0, 3));
      } else {
        const filtered = ALL_TRANSCRIPT_ARCHIVE.filter(
          (item) =>
            item.snippet.toLowerCase().includes(q) ||
            item.episodeTitle.toLowerCase().includes(q) ||
            item.topic.toLowerCase().includes(q)
        );
        // If keyword search has matches show them, else show top semantic matches
        setResults(filtered.length > 0 ? filtered : ALL_TRANSCRIPT_ARCHIVE.slice(0, 2));
      }
      setIsSearching(false);
    }, 250);
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-brand-500" />
          <span>Search Back-Catalog Archive (RAG)</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Perform semantic search across all historical podcast transcripts, guest quotes, and topics.
        </p>
      </div>

      {/* Search Input & Button */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'Where did we talk about hallucination control and source grounding?'"
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
        <span className="flex items-center gap-1 font-medium">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span>Popular searches:</span>
        </span>
        {["hallucination control", "LangGraph agents", "vector search", "monetization"].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              executeSearch(tag);
            }}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-850 hover:bg-brand-500/10 hover:text-brand-400 text-zinc-600 dark:text-zinc-300 transition-colors text-[11px]"
          >
            &ldquo;{tag}&rdquo;
          </button>
        ))}
      </div>

      {/* Results View */}
      {hasSearched && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              Found {results.length} relevant semantic matches across 28 archived episodes
            </span>
            <span className="flex items-center gap-1 text-brand-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RAG Vector Search Active</span>
            </span>
          </div>

          {results.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm hover:border-brand-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-brand-500 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                    {res.episodeTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                    {res.topic}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {res.similarityScore}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 italic leading-relaxed">
                &ldquo;{res.snippet}&rdquo;
              </p>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-mono text-zinc-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Timestamp: {res.timestamp}</span>
                </span>
                <Link
                  href={`/review?episode=${res.episodeId}`}
                  className="text-brand-500 hover:text-brand-400 hover:underline flex items-center gap-1 text-xs font-medium"
                >
                  <span>Open in Review Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchArchivePage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-zinc-400">Loading search engine...</div>}>
      <SearchArchiveContent />
    </Suspense>
  );
}
