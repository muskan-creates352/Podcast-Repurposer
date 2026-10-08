"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEpisodes } from "@/lib/api";
import { EpisodeTable } from "@/components/ui/EpisodeTable";
import { Radio, Plus } from "lucide-react";
import Link from "next/link";

export default function EpisodesPage() {
  const { data: episodes = [] } = useQuery({
    queryKey: ["episodes"],
    queryFn: fetchEpisodes,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-brand-500" />
            <span>Podcast Episodes Library</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your uploaded podcast recordings, transcription states, and repurposed outputs.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Episode</span>
        </Link>
      </div>

      <EpisodeTable episodes={episodes} />
    </div>
  );
}
