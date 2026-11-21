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
    default: "bg-[#141821] text-[#9CA3AF] border border-white/[0.06] group-hover:text-violet-400 group-hover:border-violet-500/30",
    brand: "bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:bg-violet-500/20 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.3)]",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20",
  };

  const cardContent = (
    <div className="relative group bg-[#171C26] border border-white/[0.07] rounded-2xl p-5 shadow-sm hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(139,92,246,0.12)] transition-all duration-200 cursor-pointer select-none">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider group-hover:text-violet-400 transition-colors">
              {title}
            </p>
            {href && (
              <ArrowUpRight className="w-3 h-3 text-[#9CA3AF] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-violet-400" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-[#F5F7FA] group-hover:text-violet-200 transition-colors">
              {value}
            </h3>
            {trend && (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-400">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-[#9CA3AF]">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-105 ${iconBgClasses[variant]}`}>
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
