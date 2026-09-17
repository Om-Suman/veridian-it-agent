import React from "react";
import {
  Shield,
  User,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function Message({ message, onSelectSource, onSelectTicket }) {
  const isAgent = message.sender === "agent";

  // Decision styles
  const getDecisionBadge = (decision) => {
    switch (decision) {
      case "RESOLVE":
        return (
          <span className="inline-flex items-center space-x-1 bg-[#ebf6ed] border border-[#b8e2c0] text-[#1c6434] text-xs px-2.5 py-1 rounded-xl font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>DECISION: RESOLVE</span>
          </span>
        );
      case "FOLLOW_UP":
        return (
          <span className="inline-flex items-center space-x-1 bg-[#fef8e7] border border-[#fae2a0] text-[#935f08] text-xs px-2.5 py-1 rounded-xl font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>DECISION: FOLLOW_UP</span>
          </span>
        );
      case "ESCALATE":
        return (
          <span className="inline-flex items-center space-x-1 bg-[#fdf0ed] border border-[#f5c2b9] text-[#b92510] text-xs px-2.5 py-1 rounded-xl font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
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
        <div className="h-9 w-9 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-primary shrink-0 mt-1 shadow-2xs">
          <Shield className="h-4.5 w-4.5" />
        </div>
      )}

      <div
        className={`max-w-2xl rounded-xl p-4 text-sm ${
          isAgent
            ? "bg-canvas-soft border border-hairline text-ink shadow-2xs"
            : "bg-ink text-[#fffefb] shadow-2xs"
        }`}
      >
        {/* Header with Sender Name & Time */}
        <div
          className={`flex items-center justify-between space-x-4 mb-2 pb-1.5 border-b text-xs ${
            isAgent
              ? "border-hairline text-body"
              : "border-[#3a3232] text-[#d5cdbf]"
          }`}
        >
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
              <span className="bg-canvas border border-hairline text-ink-soft text-xs px-2.5 py-1 rounded-xl font-mono">
                Team:{" "}
                <strong className="text-ink">{message.assignedTeam}</strong>
              </span>
            )}

            {message.ticketId && (
              <button
                onClick={() =>
                  onSelectTicket && onSelectTicket(message.ticketId)
                }
                className="bg-canvas hover:bg-canvas-hover border border-hairline text-primary text-xs px-2.5 py-1 rounded-xl font-mono flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>
                  Ticket: <strong>{message.ticketId}</strong>
                </span>
                <ArrowRight className="h-2.5 w-2.5" />
              </button>
            )}

            {message.ticketStatus && (
              <span className="bg-canvas border border-hairline text-body text-xs px-2.5 py-1 rounded-xl">
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
          <div className="mt-4 pt-3 border-t border-hairline">
            <div className="flex items-center space-x-1.5 text-xs text-primary font-semibold mb-2">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Attributed Policy Sources:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSource && onSelectSource(source)}
                  className="text-xs bg-canvas hover:bg-canvas-hover border border-hairline hover:border-primary text-ink px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer group shadow-2xs"
                >
                  <span className="font-semibold text-primary">
                    {source.id}
                  </span>
                  <span className="text-body-mid">—</span>
                  <span className="text-ink">{source.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Historical Context Panel */}
        {isAgent &&
          message.historicalContext &&
          message.historicalContext.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-hairline">
              <div className="flex items-center space-x-1.5 text-xs text-[#935f08] font-semibold mb-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Historical Context (Not Policy Precedent):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.historicalContext.map((hist, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-[#fef8e7] border border-[#fae2a0] text-[#935f08] px-2.5 py-1 rounded-xl font-mono"
                  >
                    <strong>{hist.ticket_id}</strong>: {hist.summary}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      {!isAgent && (
        <div className="h-9 w-9 rounded-xl bg-canvas-soft border border-hairline flex items-center justify-center text-ink shrink-0 mt-1 shadow-2xs">
          <User className="h-4.5 w-4.5" />
        </div>
      )}
    </div>
  );
}
