import React from "react";
import { AgentStatus } from "@/types";
import { Mic, Scissors, FileText, Activity, Zap, ShieldCheck } from "lucide-react";

interface PipelineCardProps {
  agents: AgentStatus[];
}

export function PipelineCard({ agents }: PipelineCardProps) {
  const getAgentIcon = (id: string) => {
    switch (id) {
      case "agent_asr":
        return <Mic className="w-4 h-4 text-amber-500" />;
      case "agent_highlight":
        return <Scissors className="w-4 h-4 text-brand-500" />;
      case "agent_content":
        return <FileText className="w-4 h-4 text-sky-500" />;
      case "agent_explain":
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return <Zap className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              LangGraph Multi-Agent Pipeline
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Parallel execution & state machine orchestration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Pipeline Active
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {agents.map((agent) => {
          const isRunning = agent.status === "running";
          const isCompleted = agent.status === "completed";

          return (
            <div
              key={agent.id}
              className="group p-3 rounded-xl border border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/80 transition-all duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 shadow-subtle">
                    {getAgentIcon(agent.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                        {agent.name}
                      </span>
                      {isRunning && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                          Running
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Ready
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {agent.currentTask || agent.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono font-medium text-zinc-400 dark:text-zinc-500 block">
                    {agent.latency}
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {agent.lastActive}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
