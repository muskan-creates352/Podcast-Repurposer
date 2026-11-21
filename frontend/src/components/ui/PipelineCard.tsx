import React from "react";
import Link from "next/link";
import { AgentStatus } from "@/types";
import { Mic, Scissors, FileText, Activity, Zap, ShieldCheck, ChevronRight } from "lucide-react";

interface PipelineCardProps {
  agents: AgentStatus[];
}

export function PipelineCard({ agents }: PipelineCardProps) {
  const getAgentIcon = (id: string) => {
    switch (id) {
      case "agent_asr":
        return <Mic className="w-4 h-4 text-amber-400" />;
      case "agent_highlight":
        return <Scissors className="w-4 h-4 text-violet-400" />;
      case "agent_content":
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case "agent_explain":
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <Zap className="w-4 h-4 text-[#9CA3AF]" />;
    }
  };

  return (
    <div className="bg-[#171C26] border border-white/[0.07] rounded-2xl p-5 shadow-sm hover:border-white/[0.12] transition-all duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              LangGraph Multi-Agent Pipeline
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Parallel execution & state machine orchestration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </span>
          <span className="text-xs font-medium text-emerald-400">
            Pipeline Active
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {agents.map((agent) => {
          const isRunning = agent.status === "running";
          const isCompleted = agent.status === "completed";

          return (
            <Link
              key={agent.id}
              href="/review"
              className="group block p-3 rounded-xl border border-white/[0.05] bg-[#141821] hover:bg-[#1A202C] hover:border-violet-500/40 hover:translate-x-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#171C26] border border-white/[0.06] shadow-sm group-hover:scale-105 group-hover:border-violet-500/30 transition-transform">
                    {getAgentIcon(agent.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F5F7FA] group-hover:text-violet-300 transition-colors">
                        {agent.name}
                      </span>
                      {isRunning && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                          Running
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Ready
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                      {agent.currentTask || agent.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-medium text-[#9CA3AF] block">
                      {agent.latency}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]/70">
                      {agent.lastActive}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-violet-400 shrink-0" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
