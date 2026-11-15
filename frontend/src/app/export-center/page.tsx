"use client";

import React, { useState } from "react";
import { 
  Download, 
  Film, 
  FileText, 
  HardDrive, 
  Copy, 
  Check 
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ExportFile {
  id: string;
  name: string;
  format: "MP4 Video (9:16)" | "MP4 Video (16:9)" | "Markdown Report" | "JSON Bundle" | "TXT Transcripts";
  size: string;
  date: string;
  duration?: string;
  downloadUrl: string;
  status: "ready" | "processing";
}

const INITIAL_EXPORTS: ExportFile[] = [
  {
    id: "exp_1",
    name: "clip_why_single_prompt_fail_9x16.mp4",
    format: "MP4 Video (9:16)",
    size: "4.8 MB",
    date: "10 mins ago",
    duration: "56s",
    downloadUrl: "/api/exports/clip_test1_9x16.mp4",
    status: "ready",
  },
  {
    id: "exp_2",
    name: "ep_101_multimodal_insights_report.md",
    format: "Markdown Report",
    size: "24 KB",
    date: "25 mins ago",
    downloadUrl: "#",
    status: "ready",
  },
  {
    id: "exp_3",
    name: "clip_timestamp_grounding_rule_16x9.mp4",
    format: "MP4 Video (16:9)",
    size: "6.2 MB",
    date: "1 hour ago",
    duration: "50s",
    downloadUrl: "/api/exports/clip_test1_9x16.mp4",
    status: "ready",
  },
  {
    id: "exp_4",
    name: "social_video_repurposed_10_formats.json",
    format: "JSON Bundle",
    size: "18 KB",
    date: "2 hours ago",
    downloadUrl: "#",
    status: "ready",
  },
];

export default function ExportCenterPage() {
  const { showToast } = useToast();
  const [exports] = useState<ExportFile[]>(INITIAL_EXPORTS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDownload = (file: ExportFile) => {
    if (file.downloadUrl === "#") {
      const blob = new Blob([`# ${file.name}\nExported from Podcast Repurposer`], {
        type: "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement("a");
      a.href = file.downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    showToast(`Downloading ${file.name}...`, "success");
  };

  const handleCopyLink = (file: ExportFile) => {
    navigator.clipboard.writeText(window.location.origin + file.downloadUrl);
    setCopiedId(file.id);
    showToast("Download link copied to clipboard", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Export Center
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Download your rendered MP4 video clips, subtitles, reports, and repurposed social content bundles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono">
            {exports.length} Total Files Ready
          </span>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400">Rendered Video Clips</span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">2 MP4 Videos</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400">Reports & Transcripts</span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">2 Documents</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400">Total Storage Used</span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">11.0 MB</h3>
          </div>
        </div>
      </div>

      {/* Export Files Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Ready for Download
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400">
                <th className="pb-3 font-semibold">File Name</th>
                <th className="pb-3 font-semibold">Format</th>
                <th className="pb-3 font-semibold">Size</th>
                <th className="pb-3 font-semibold">Created</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {exports.map((file) => (
                <tr key={file.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      {file.format.includes("MP4") ? (
                        <Film className="w-4 h-4 text-purple-400 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                      )}
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-zinc-400">{file.format}</td>
                  <td className="py-3.5 pr-4 text-zinc-400 font-mono">{file.size}</td>
                  <td className="py-3.5 pr-4 text-zinc-400">{file.date}</td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopyLink(file)}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
                        title="Copy Link"
                      >
                        {copiedId === file.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDownload(file)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
