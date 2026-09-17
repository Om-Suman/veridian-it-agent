import React from "react";
import {
  Shield,
  User,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function Message({ message, onSelectSource, onSelectTicket }) {
  const isAgent = message.sender === "agent";

  // Decision styles
  const getDecisionBadge = (decision) => {
    switch (decision) {
      case "RESOLVE":
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            <span>DECISION: RESOLVE</span>
          </span>
        );
      case "FOLLOW_UP":
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-950/80 border border-amber-500/40 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            <AlertTriangle className="h-3 w-3" />
            <span>DECISION: FOLLOW_UP</span>
          </span>
        );
      case "ESCALATE":
        return (
          <span className="inline-flex items-center space-x-1 bg-rose-950/80 border border-rose-500/40 text-rose-400 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            <AlertCircle className="h-3 w-3" />
            <span>DECISION: ESCALATE</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex items-start space-x-3 my-4 ${isAgent ? "justify-start" : "justify-end"}`}
    >
      {isAgent && (
        <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-1">
          <Shield className="h-5 w-5" />
        </div>
      )}

      <div
        className={`max-w-2xl rounded-xl p-4 text-sm ${
          isAgent
            ? "bg-slate-800/90 border border-slate-700/80 text-slate-100 shadow-md"
            : "bg-blue-600 text-white shadow-md"
        }`}
      >
        {/* Header with Sender Name & Time */}
        <div className="flex items-center justify-between space-x-4 mb-2 pb-1.5 border-b border-white/10 text-xs opacity-80">
          <span className="font-semibold flex items-center space-x-1.5">
            {isAgent ? (
              <span>Veridian Service Agent</span>
            ) : (
              <span>{message.employeeName || "Employee"}</span>
            )}
          </span>
          <span className="text-[11px]">
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>

        {/* Badges for Agent Decisions, Assigned Team, and Ticket */}
        {isAgent && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {getDecisionBadge(message.decision)}

            {message.assignedTeam && (
              <span className="bg-slate-900/80 border border-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded font-mono">
                Team:{" "}
                <strong className="text-white">{message.assignedTeam}</strong>
              </span>
            )}

            {message.ticketId && (
              <button
                onClick={() =>
                  onSelectTicket && onSelectTicket(message.ticketId)
                }
                className="bg-blue-950/80 hover:bg-blue-900 border border-blue-600/40 text-blue-300 text-xs px-2 py-0.5 rounded font-mono flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>
                  Ticket: <strong>{message.ticketId}</strong>
                </span>
                <ArrowRight className="h-2.5 w-2.5" />
              </button>
            )}

            {message.ticketStatus && (
              <span className="bg-slate-900/60 border border-slate-700 text-slate-400 text-xs px-2 py-0.5 rounded">
                Status: {message.ticketStatus}
              </span>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>

        {/* Policy Sources Panel */}
        {isAgent && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <div className="flex items-center space-x-1.5 text-xs text-blue-400 font-semibold mb-2">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Attributed Policy Sources:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSource && onSelectSource(source)}
                  className="text-xs bg-slate-900 hover:bg-blue-950/60 border border-slate-700 hover:border-blue-500/50 text-slate-200 px-2.5 py-1 rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer group"
                >
                  <span className="font-semibold text-blue-400 group-hover:text-blue-300">
                    {source.id}
                  </span>
                  <span className="text-slate-400">—</span>
                  <span className="text-slate-300">{source.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Historical Context Panel */}
        {isAgent &&
          message.historicalContext &&
          message.historicalContext.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-700/40">
              <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold mb-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Historical Context (Not Policy Precedent):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.historicalContext.map((hist, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-amber-950/40 border border-amber-500/30 text-amber-200/90 px-2 py-0.5 rounded"
                  >
                    <strong>{hist.ticket_id}</strong>: {hist.summary}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      {!isAgent && (
        <div className="h-9 w-9 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 mt-1">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
