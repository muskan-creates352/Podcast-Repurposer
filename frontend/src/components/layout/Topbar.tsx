"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { fetchNotifications } from "@/lib/api";
import { NotificationItem } from "@/types";
import {
  Search,
  Bell,
  Sun,
  Moon,
  UploadCloud,
  Command,
  LogOut,
  Settings,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio
} from "lucide-react";

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Fetch real notifications dynamically
  const { data: serverNotifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  // Calculate read states
  const notifications: NotificationItem[] = serverNotifications.map((n) => ({
    ...n,
    read: n.read || readNotifIds.includes(n.id),
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    showToast("Signed out successfully. See you soon!", "info");
  };

  const handleMarkAllRead = () => {
    const allIds = serverNotifications.map((n) => n.id);
    setReadNotifIds(allIds);
    showToast("All notifications marked as read", "success");
  };

  const handleNotificationClick = (n: NotificationItem) => {
    setReadNotifIds((prev) => [...prev, n.id]);
    setShowNotifications(false);
    if (n.episode_id) {
      router.push(`/episodes/${n.episode_id}`);
    }
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "M";

  return (
    <header className="h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#0c0c0e]/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Quick Search */}
      <form onSubmit={handleGlobalSearch} className="flex items-center gap-3 w-72 sm:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcripts, clips, or episodes (Press Enter)..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 hover:text-brand-500 transition-colors"
          >
            <Command className="w-2.5 h-2.5" />
            <span>↵</span>
          </button>
        </div>
      </form>

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

        {/* Notifications Popover with Real Data */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-brand-500 text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 shadow-xl p-4 z-50 animate-slide-up text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-500/10 text-brand-500 font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-brand-500 hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-zinc-400 text-xs">
                    No notifications at this time
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        n.read
                          ? "bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-800 opacity-70"
                          : "bg-white dark:bg-zinc-850 border-brand-500/30 shadow-sm"
                      }`}
                    >
                      <div className="p-1 rounded-lg shrink-0 mt-0.5">
                        {n.type === "ready_for_review" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                        {n.type === "failed" && (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        )}
                        {n.type === "processing" && (
                          <Clock className="w-4 h-4 text-brand-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs ${n.read ? "text-zinc-600 dark:text-zinc-300" : "font-semibold text-zinc-900 dark:text-zinc-100"}`}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-zinc-400">{n.time}</span>
                          {n.episode_id && (
                            <span className="text-[10px] text-brand-500 font-mono hover:underline flex items-center gap-0.5">
                              <Radio className="w-2.5 h-2.5" />
                              View Studio
                            </span>
                          )}
                        </div>
                      </div>

                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Interactive Dropdown Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-sky-400 hover:ring-2 hover:ring-brand-500/50 transition-all text-white flex items-center justify-center text-xs font-bold shadow-sm cursor-pointer select-none"
            title="Profile Menu & Sign Out"
          >
            {userInitial}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 shadow-2xl p-2 z-50 animate-slide-up text-xs">
              {/* User Header Info */}
              <div className="p-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {user?.name || "Muskan Kumari"}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {user?.email || "muskan@podcastrepurposer.ai"}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <span>Active Workspace Session</span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-1.5 space-y-0.5">
                <Link
                  href="/analytics"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Studio Analytics</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Workspace Settings</span>
                </Link>

                <Link
                  href="/login"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-brand-400" />
                    <span>Switch User Account</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Login</span>
                </Link>
              </div>

              {/* Sign Out Action */}
              <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
