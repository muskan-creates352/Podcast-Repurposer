"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Radio,
  Video,
  UploadCloud,
  Brain,
  Scissors,
  Sparkles,
  CheckSquare,
  MessageSquare,
  Search,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Grouped Navigation: Workspace, AI Workspace, Management
  const navSections = [
    {
      title: "Workspace",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Episodes", href: "/episodes", icon: Radio },
        { name: "YouTube Import", href: "/youtube", icon: Video, badge: "New", badgeColor: "bg-rose-500" },
        { name: "Upload", href: "/upload", icon: UploadCloud },
      ],
    },
    {
      title: "AI Workspace",
      items: [
        { name: "Podcast Insights", href: "/insights", icon: Brain, badge: "AI", badgeColor: "bg-gradient-to-r from-purple-500 to-indigo-500" },
        { name: "Clip Studio", href: "/clip-studio", icon: Scissors },
        { name: "Content Studio", href: "/content-studio", icon: Sparkles },
        { name: "AI Chatbot", href: "/chat", icon: MessageSquare },
        { name: "Search Archive", href: "/search", icon: Search },
      ],
    },
    {
      title: "Management",
      items: [
        { name: "Review Queue", href: "/review", icon: CheckSquare, badge: "12", badgeColor: "bg-brand-500" },
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
        { name: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "M";

  return (
    <aside
      className={`border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#0c0c0e]/95 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0 z-30 transition-all duration-300 select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800/60">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-700 flex items-center justify-center text-white shadow-glow shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1 truncate">
                  PodcastRepurpose
                </span>
                <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase block truncate">
                  One Podcast. Endless Content.
                </span>
              </div>
            )}
          </Link>

          {/* Collapse/Expand Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((section, sIdx) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed ? (
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {section.title}
                </p>
              ) : (
                sIdx > 0 && <div className="my-2 border-t border-zinc-200 dark:border-zinc-800/60 mx-2" />
              )}

              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center ${
                      isCollapsed ? "justify-center" : "justify-between"
                    } px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${
                      isActive
                        ? "bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white shadow-sm shrink-0 ${
                          item.badgeColor || "bg-brand-500"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Profile Section */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/60">
        <div
          className={`p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              {userInitial}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 truncate">
                  {user?.name || "Muskan Kumari"}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {user?.email || "muskan@podcast.ai"}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
