"use client";

import React, { useState } from "react";
import { Search, Sparkles, Radio, ExternalLink } from "lucide-react";

export default function SearchArchivePage() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const mockSearchResults = [
    {
      episodeTitle: "Ep. 42: Building Autonomous Multi-Agent AI Systems with LangGraph",
      timestamp: "18:45",
      snippet: "If you want creators to actually trust AI output, you have to provide source timestamps. Never present a generated claim without showing exactly which second it was spoken.",
      similarityScore: "94% Match",
    },
    {
      episodeTitle: "Ep. 40: The Architecture of Next-Gen Vector Search & Embeddings",
      timestamp: "24:10",
      snippet: "Vector search allows retrieval over months of podcast transcripts in under 50ms using cosine similarity on chunked embeddings.",
      similarityScore: "88% Match",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setHasSearched(true);
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
          Perform semantic search across all historical podcast transcripts, guest quotes, and topics.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative">
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
          Search
        </button>
      </form>

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Found 2 relevant semantic matches across 28 archived episodes</span>
            <span className="flex items-center gap-1 text-brand-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RAG Vector Search Active</span>
            </span>
          </div>

          {mockSearchResults.map((res, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm hover:border-brand-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-brand-500" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                    {res.episodeTitle}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {res.similarityScore}
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 italic">
                &ldquo;{res.snippet}&rdquo;
              </p>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-mono text-zinc-400 font-medium">
                  Timestamp: {res.timestamp}
                </span>
                <button className="text-brand-500 hover:underline flex items-center gap-1 text-xs font-medium">
                  <span>Jump to Audio Timestamp</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
