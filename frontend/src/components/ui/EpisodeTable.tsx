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
    <div className="bg-[#171C26] border border-white/[0.07] rounded-2xl overflow-hidden shadow-sm hover:border-white/[0.12] transition-all duration-200">
      <div className="p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F7FA]">
            Recent Episodes
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            Real-time status, transcription progress, and review pipelines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search episodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 py-1.5 text-xs rounded-xl bg-[#141821] border border-white/[0.08] text-[#F5F7FA] placeholder:text-[#9CA3AF] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 hover:border-white/[0.15] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F5F7FA]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Link
            href="/episodes"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-all px-2.5 py-1.5 rounded-lg hover:bg-violet-500/10"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141821] text-[#9CA3AF] border-b border-white/[0.06] uppercase tracking-wider font-medium text-[11px]">
            <tr>
              <th className="px-5 py-3">Episode Title</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Processing Progress</th>
              <th className="px-5 py-3">Created Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredEpisodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[#9CA3AF]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>No episodes found matching &ldquo;{searchTerm}&rdquo;.</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-xs text-violet-400 hover:underline font-medium"
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
                  className="hover:bg-[#1A202C] transition-colors duration-150 group cursor-pointer"
                >
                  <td className="px-5 py-3.5 font-medium text-[#F5F7FA] max-w-xs truncate">
                    <Link
                      href={`/episodes/${episode.id}`}
                      className="flex items-center gap-2.5 group-hover:text-violet-300 transition-colors"
                      title="Open Episode Studio"
                    >
                      <div className="p-1.5 rounded-lg bg-[#141821] text-[#9CA3AF] group-hover:text-violet-400 group-hover:bg-violet-500/10 border border-white/[0.04] transition-colors">
                        <Play className="w-3 h-3 fill-current" />
                      </div>
                      <span className="truncate">{episode.title}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={episode.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[#9CA3AF]">
                    {episode.duration}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 max-w-[140px]">
                      <div className="flex-1 h-1.5 bg-[#141821] border border-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            episode.progress === 100
                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                              : "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                          }`}
                          style={{ width: `${episode.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-[#9CA3AF]">
                        {episode.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#9CA3AF]">
                    {formatDate(episode.created_at)}
                  </td>
                  <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/episodes/${episode.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-violet-500/10 hover:bg-violet-600 hover:text-white text-violet-400 border border-violet-500/20 transition-all duration-150"
                      >
                        <span>Studio</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <Link
                        href={`/review?episode=${episode.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#141821] hover:bg-violet-600 hover:text-white text-[#9CA3AF] hover:text-white border border-white/[0.06] hover:border-violet-500/30 transition-all duration-150 shadow-sm"
                      >
                        <span>Review</span>
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
