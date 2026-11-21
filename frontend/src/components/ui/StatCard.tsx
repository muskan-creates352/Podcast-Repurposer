import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: React.ReactNode;
  variant?: "default" | "brand" | "amber" | "emerald";
  href?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = "default",
  href,
  onClick,
}: StatCardProps) {
  const iconBgClasses = {
    default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700",
    brand: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 group-hover:bg-brand-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20",
  };

  const cardContent = (
    <div className="relative group bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:border-brand-500/70 dark:hover:border-brand-500/70 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(139,92,246,0.18)] transition-all duration-200 cursor-pointer select-none">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
              {title}
            </p>
            {href && (
              <ArrowUpRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-brand-500" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
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
        <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${iconBgClasses[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{cardContent}</Link>;
  }

  return <div onClick={onClick}>{cardContent}</div>;
}
