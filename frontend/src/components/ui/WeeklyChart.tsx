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
    <div className="bg-[#171C26] border border-white/[0.07] rounded-2xl p-5 shadow-sm hover:border-white/[0.12] transition-all duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              Episodes Processed Per Week
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Weekly processing throughput & generated viral clips
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6] shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span>
            <span className="text-[#9CA3AF]">Clips</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span>
            <span className="text-[#9CA3AF]">Episodes</span>
          </div>
        </div>
      </div>

      <div className="h-[220px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(139, 92, 246, 0.08)", radius: 6 }}
              contentStyle={{
                backgroundColor: "#141821",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "0.75rem",
                color: "#F5F7FA",
                fontSize: "12px",
                boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.6)",
              }}
              itemStyle={{ padding: "2px 0", color: "#F5F7FA" }}
            />
            <Bar dataKey="clips" name="Clips Generated" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={28} cursor="pointer" />
            <Bar dataKey="episodes" name="Episodes" fill="#22D3EE" radius={[4, 4, 0, 0]} maxBarSize={28} cursor="pointer" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
