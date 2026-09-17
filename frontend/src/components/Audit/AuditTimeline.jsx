import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Ticket,
  MessageSquare,
  Cpu,
  User,
  Shield,
  Layers,
} from "lucide-react";

export default function AuditTimeline({ logs = [], compact = false }) {
  const getActionIcon = (action) => {
    switch (action) {
      case "REQUEST_RECEIVED":
        return <MessageSquare className="h-3.5 w-3.5 text-blue-400" />;
      case "INTENT_CLASSIFIED":
        return <Cpu className="h-3.5 w-3.5 text-purple-400" />;
      case "POLICY_RETRIEVED":
        return <BookOpen className="h-3.5 w-3.5 text-cyan-400" />;
      case "DECISION_MADE":
        return <Shield className="h-3.5 w-3.5 text-emerald-400" />;
      case "TICKET_CREATED":
      case "TICKET_UPDATED":
        return <Ticket className="h-3.5 w-3.5 text-indigo-400" />;
      case "ESCALATED":
        return <AlertCircle className="h-3.5 w-3.5 text-rose-400" />;
      case "RESOLVED":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      case "FOLLOW_UP_REQUESTED":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Layers className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case "ESCALATED":
        return "bg-rose-950/60 border-rose-500/40 text-rose-400";
      case "RESOLVED":
        return "bg-emerald-950/60 border-emerald-500/40 text-emerald-400";
      case "FOLLOW_UP_REQUESTED":
        return "bg-amber-950/60 border-amber-500/40 text-amber-400";
      case "DECISION_MADE":
        return "bg-purple-950/60 border-purple-500/40 text-purple-400";
      case "POLICY_RETRIEVED":
        return "bg-cyan-950/60 border-cyan-500/40 text-cyan-400";
      default:
        return "bg-slate-800 border-slate-700 text-slate-300";
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        No audit events recorded yet.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((event, idx) => {
          const isLast = idx === logs.length - 1;
          const timeString = event.timestamp
            ? new Date(event.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "";

          return (
            <li key={event.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  {/* Icon Circle */}
                  <div>
                    <span className="h-8 w-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center ring-4 ring-slate-900 shadow-md">
                      {getActionIcon(event.action)}
                    </span>
                  </div>

                  {/* Event Details Box */}
                  <div className="flex-1 min-w-0 bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${getActionBadgeClass(event.action)}`}
                        >
                          {event.action}
                        </span>
                        <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                          <User className="h-3 w-3 text-slate-500" />
                          <span>{event.actor || "System"}</span>
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {timeString}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                      {event.details}
                    </p>

                    {/* Meta tags: Ticket ID & Sources */}
                    {(event.ticket_id ||
                      (event.source_ids && event.source_ids.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
                        {event.ticket_id && (
                          <span className="bg-slate-950 border border-slate-700 text-blue-400 font-mono px-1.5 py-0.5 rounded">
                            {event.ticket_id}
                          </span>
                        )}
                        {event.source_ids &&
                          event.source_ids.map((src, i) => (
                            <span
                              key={i}
                              className="bg-slate-950 border border-slate-700 text-cyan-400 font-mono px-1.5 py-0.5 rounded"
                            >
                              {src}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
