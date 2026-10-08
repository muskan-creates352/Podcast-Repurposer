"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Search,
  Bell,
  Sun,
  Moon,
  UploadCloud,
  Command,
} from "lucide-react";

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: "1",
      title: "Clips ready for Ep. 42",
      time: "5m ago",
      read: false,
    },
    {
      id: "2",
      title: "Transcription finished for Ep. 41",
      time: "25m ago",
      read: true,
    },
  ];

  return (
    <header className="h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#0c0c0e]/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Quick Search */}
      <div className="flex items-center gap-3 w-72 sm:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search transcripts, clips, or episodes..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Quick Upload Button */}
        <Link
          href="/upload"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Episode</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700" />
          )}
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 shadow-xl p-4 z-50 animate-slide-up text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Notifications
                </span>
                <button
                  onClick={() => {
                    showToast("All notifications marked as read", "success");
                    setShowNotifications(false);
                  }}
                  className="text-[11px] text-brand-500 hover:underline"
                >
                  Mark all as read
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 hover:border-brand-500/30 transition-colors cursor-pointer"
                  >
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      {n.title}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center text-xs font-bold shadow-sm">
          {user?.name ? user.name[0].toUpperCase() : "M"}
        </div>
      </div>
    </header>
  );
}
