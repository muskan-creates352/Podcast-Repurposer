"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { WeeklyProcessingStat } from "@/types";
import { BarChart3 } from "lucide-react";

interface WeeklyChartProps {
  data: WeeklyProcessingStat[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:border-zinc-700/80 transition-all duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Episodes Processed Per Week
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Weekly processing throughput & generated clips
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-500"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Clips</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Episodes</span>
          </div>
        </div>
      </div>

      <div className="h-[220px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.25} />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(139, 92, 246, 0.12)", radius: 6 }}
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#3f3f46",
                borderRadius: "0.75rem",
                color: "#ffffff",
                fontSize: "12px",
                boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.5)",
              }}
              itemStyle={{ padding: "2px 0", color: "#e4e4e7" }}
            />
            <Bar dataKey="clips" name="Clips Generated" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={28} cursor="pointer" />
            <Bar dataKey="episodes" name="Episodes" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={28} cursor="pointer" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
