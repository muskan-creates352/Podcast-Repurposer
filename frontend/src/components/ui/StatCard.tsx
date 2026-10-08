import React from "react";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: React.ReactNode;
  variant?: "default" | "brand" | "amber" | "emerald";
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = "default",
}: StatCardProps) {
  const iconBgClasses = {
    default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
    brand: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  };

  return (
    <div className="relative group bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-cardHover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {value}
            </h3>
            {trend && (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgClasses[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
