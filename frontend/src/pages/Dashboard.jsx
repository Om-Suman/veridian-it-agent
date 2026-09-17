import React from "react";
import {
  Shield,
  Ticket,
  BookOpen,
  Activity,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Terminal,
} from "lucide-react";

export default function Dashboard({
  tickets = [],
  policies = [],
  auditLogs = [],
  requests = [],
  onRunDemo,
  onNavigate,
}) {
  const openCount = tickets.filter(
    (t) => !["RESOLVED", "CLOSED"].includes(t.status),
  ).length;
  const escalatedCount = tickets.filter(
    (t) => t.status === "ESCALATED" || t.decision === "ESCALATE",
  ).length;
  const resolvedCount = tickets.filter((t) =>
    ["RESOLVED", "CLOSED"].includes(t.status),
  ).length;

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case "RESOLVE":
        return (
          <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
            RESOLVE
          </span>
        );
      case "FOLLOW_UP":
        return (
          <span className="bg-amber-950/60 border border-amber-500/40 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
            FOLLOW_UP
          </span>
        );
      case "ESCALATE":
        return (
          <span className="bg-rose-950/60 border border-rose-500/40 text-rose-400 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
            ESCALATE
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded">
            {decision}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
            <Shield className="h-4 w-4" />
            <span>Autonomous Service Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Veridian Corp Internal IT Service Agent
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Enterprise support system governed by deterministic policy
            enforcement and FAISS-based RAG retrieval. Operating with strict
            adherence to authoritative Veridian Corp policies without
            hallucinating approvals.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("chat")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <span>Open AI Service Agent</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate("tickets")}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              <span>View Ticket Queue ({tickets.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Open Tickets</span>
            <Ticket className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {openCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pending action or review
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Escalated Cases</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {escalatedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Security / Finance / Human IT
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Resolved Tickets</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {resolvedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Closed per verified policy
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Policy Documents</span>
            <BookOpen className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {policies.length || 11}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            KB-01 to KB-10 + Asset Policy
          </p>
        </div>
      </div>

      {/* Authoritative Demo Test Scenarios Section (REQ-01 through REQ-15) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <span>Specification Employee Requests (REQ-01 to REQ-15)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any scenario to test deterministic policy routing, FAISS
              source attribution, and ticket creation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {requests.map((req) => (
            <div
              key={req.request_id}
              onClick={() => onRunDemo && onRunDemo(req)}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 transition-all duration-150 cursor-pointer group flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-blue-400 text-xs bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
                    {req.request_id}
                  </span>
                  {getDecisionBadge(req.expected_decision)}
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {req.employee_name}
                </h3>
                <p className="text-xs text-slate-400 mb-2">{req.category}</p>

                <p className="text-xs text-slate-300 italic line-clamp-2 bg-slate-900/60 p-2 rounded border border-slate-800/80 mb-2">
                  "{req.request_text}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[170px] text-cyan-400 font-mono">
                  {req.relevant_policies.length > 0
                    ? req.relevant_policies.join(", ")
                    : "No Policy (Human)"}
                </span>
                <span className="text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                  <span>Test Run</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
