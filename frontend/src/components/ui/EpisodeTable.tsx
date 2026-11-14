"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Episode } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils";
import { Play, ArrowRight, Search, X } from "lucide-react";

interface EpisodeTableProps {
  episodes: Episode[];
  onOpenReview?: (id: string) => void;
}

export function EpisodeTable({ episodes }: EpisodeTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEpisodes = episodes.filter((ep) =>
    ep.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm hover:border-zinc-700/80 transition-all duration-200">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Episodes
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real-time status, transcription progress, and review pipelines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search episodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-500 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Link
            href="/episodes"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 flex items-center gap-1 transition-all px-2.5 py-1.5 rounded-lg hover:bg-brand-500/10"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/60 uppercase tracking-wider font-medium">
            <tr>
              <th className="px-5 py-3">Episode Title</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Processing Progress</th>
              <th className="px-5 py-3">Created Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredEpisodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>No episodes found matching &ldquo;{searchTerm}&rdquo;.</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-xs text-brand-500 hover:underline font-medium"
                      >
                        Clear search filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredEpisodes.map((episode) => (
                <tr
                  key={episode.id}
                  onClick={() => router.push(`/review?episode=${episode.id}`)}
                  className="hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70 transition-colors duration-150 group cursor-pointer"
                >
                  <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-200 max-w-xs truncate">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-sm">
                        <Play className="w-3 h-3 fill-current" />
                      </div>
                      <span className="truncate group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                        {episode.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={episode.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-zinc-500 dark:text-zinc-400">
                    {episode.duration}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 max-w-[140px]">
                      <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            episode.progress === 100
                              ? "bg-emerald-500"
                              : "bg-brand-500 animate-pulse-subtle"
                          }`}
                          style={{ width: `${episode.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {episode.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400">
                    {formatDate(episode.created_at)}
                  </td>
                  <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {episode.status === "uploaded" && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              await fetch(`http://localhost:8000/api/episodes/${episode.id}/process`, { method: "POST" });
                              window.location.reload();
                            } catch {}
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          Process AI
                        </button>
                      )}
                      <Link
                        href={`/review?episode=${episode.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white text-zinc-700 dark:text-zinc-300 transition-all duration-150 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
