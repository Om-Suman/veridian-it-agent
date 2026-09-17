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
          <span className="bg-[#ebf6ed] border border-[#b8e2c0] text-[#1c6434] text-[10px] font-mono px-2 py-0.5 rounded-lg font-semibold">
            RESOLVE
          </span>
        );
      case "FOLLOW_UP":
        return (
          <span className="bg-[#fef8e7] border border-[#fae2a0] text-[#935f08] text-[10px] font-mono px-2 py-0.5 rounded-lg font-semibold">
            FOLLOW_UP
          </span>
        );
      case "ESCALATE":
        return (
          <span className="bg-[#fdf0ed] border border-[#f5c2b9] text-[#b92510] text-[10px] font-mono px-2 py-0.5 rounded-lg font-semibold">
            ESCALATE
          </span>
        );
      default:
        return (
          <span className="bg-canvas-soft border border-hairline text-ink-soft text-[10px] font-mono px-2 py-0.5 rounded-lg">
            {decision}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-canvas-soft border border-hairline rounded-xl p-6 sm:p-8 shadow-2xs">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            <Shield className="h-4 w-4" />
            <span>Autonomous Service Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-ink tracking-tight">
            Veridian Corp Internal IT Service Agent
          </h1>
          <p className="text-sm text-body mt-2.5 leading-relaxed">
            Enterprise support system governed by deterministic policy
            enforcement and FAISS-based RAG retrieval. Operating with strict
            adherence to authoritative Veridian Corp policies without
            hallucinating approvals.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("chat")}
              className="bg-primary hover:bg-primary-hover text-[#fffefb] font-medium px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Open AI Service Agent</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate("tickets")}
              className="bg-canvas hover:bg-canvas-hover border border-hairline text-ink font-medium px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <span>View Ticket Queue ({tickets.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-canvas-soft border border-hairline rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-body text-xs mb-2">
            <span>Active Open Tickets</span>
            <Ticket className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono">
            {openCount}
          </div>
          <p className="text-[11px] text-body-mid mt-1">
            Pending action or review
          </p>
        </div>

        <div className="bg-canvas-soft border border-hairline rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-body text-xs mb-2">
            <span>Escalated Cases</span>
            <AlertCircle className="h-4 w-4 text-[#b92510]" />
          </div>
          <div className="text-2xl font-bold text-[#b92510] font-mono">
            {escalatedCount}
          </div>
          <p className="text-[11px] text-body-mid mt-1">
            Security / Finance / Human IT
          </p>
        </div>

        <div className="bg-canvas-soft border border-hairline rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-body text-xs mb-2">
            <span>Resolved Tickets</span>
            <CheckCircle2 className="h-4 w-4 text-[#1c6434]" />
          </div>
          <div className="text-2xl font-bold text-[#1c6434] font-mono">
            {resolvedCount}
          </div>
          <p className="text-[11px] text-body-mid mt-1">
            Closed per verified policy
          </p>
        </div>

        <div className="bg-canvas-soft border border-hairline rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-body text-xs mb-2">
            <span>Active Policy Documents</span>
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono">
            {policies.length || 11}
          </div>
          <p className="text-[11px] text-body-mid mt-1">
            KB-01 to KB-10 + Asset Policy
          </p>
        </div>
      </div>

      {/* Authoritative Demo Test Scenarios Section (REQ-01 through REQ-15) */}
      <div className="bg-canvas-soft border border-hairline rounded-xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-ink flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Specification Employee Requests (REQ-01 to REQ-15)</span>
            </h2>
            <p className="text-xs text-body mt-0.5">
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
              className="bg-canvas hover:bg-canvas-hover border border-hairline hover:border-primary rounded-xl p-4 transition-all duration-150 cursor-pointer group flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-primary text-xs bg-canvas-soft px-2 py-0.5 rounded-lg border border-hairline">
                    {req.request_id}
                  </span>
                  {getDecisionBadge(req.expected_decision)}
                </div>

                <h3 className="text-sm font-semibold text-ink group-hover:text-primary transition-colors">
                  {req.employee_name}
                </h3>
                <p className="text-xs text-body-mid mb-2">{req.category}</p>

                <p className="text-xs text-body italic line-clamp-2 bg-canvas-soft p-2.5 rounded-xl border border-hairline mb-2">
                  "{req.request_text}"
                </p>
              </div>

              <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px] text-body">
                <span className="truncate max-w-[170px] text-body-mid font-mono">
                  {req.relevant_policies.length > 0
                    ? req.relevant_policies.join(", ")
                    : "No Policy (Human)"}
                </span>
                <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
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
