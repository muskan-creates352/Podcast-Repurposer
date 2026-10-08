"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Episode } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils";
import { Play, ArrowRight, Search } from "lucide-react";

interface EpisodeTableProps {
  episodes: Episode[];
  onOpenReview?: (id: string) => void;
}

export function EpisodeTable({ episodes }: EpisodeTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEpisodes = episodes.filter((ep) =>
    ep.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
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
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <Link
            href="/episodes"
            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1 transition-colors px-2 py-1.5"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {filteredEpisodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                  No episodes found matching your search.
                </td>
              </tr>
            ) : (
              filteredEpisodes.map((episode) => (
                <tr
                  key={episode.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors duration-150 group"
                >
                  <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-200 max-w-xs truncate">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-brand-500 transition-colors">
                        <Play className="w-3 h-3" />
                      </div>
                      <span className="truncate">{episode.title}</span>
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
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/review?episode=${episode.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-600 text-zinc-700 dark:text-zinc-300 transition-all duration-150"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
