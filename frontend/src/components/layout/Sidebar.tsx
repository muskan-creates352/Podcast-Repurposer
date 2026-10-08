"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Radio,
  UploadCloud,
  CheckSquare,
  Search,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Episodes", href: "/episodes", icon: Radio },
    { name: "Upload", href: "/upload", icon: UploadCloud },
    { name: "Review Queue", href: "/review", icon: CheckSquare, badge: "12" },
    { name: "Search Archive", href: "/search", icon: Search },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#0c0c0e]/90 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              PodcastRepurpose
            </span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase block">
              GenAI Creator Studio
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <p className="px-3 py-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Workspace
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-subtle"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Profile Section */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : "M"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 truncate">
                {user?.name || "Muskan Kumari"}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                {user?.email || "muskan@podcast.ai"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
