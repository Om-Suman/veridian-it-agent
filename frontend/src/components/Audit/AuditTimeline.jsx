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
        return <MessageSquare className="h-3.5 w-3.5 text-primary" />;
      case "INTENT_CLASSIFIED":
        return <Cpu className="h-3.5 w-3.5 text-primary" />;
      case "POLICY_RETRIEVED":
        return <BookOpen className="h-3.5 w-3.5 text-primary" />;
      case "DECISION_MADE":
        return <Shield className="h-3.5 w-3.5 text-[#1c6434]" />;
      case "TICKET_CREATED":
      case "TICKET_UPDATED":
        return <Ticket className="h-3.5 w-3.5 text-primary" />;
      case "ESCALATED":
        return <AlertCircle className="h-3.5 w-3.5 text-[#b92510]" />;
      case "RESOLVED":
        return <CheckCircle2 className="h-3.5 w-3.5 text-[#1c6434]" />;
      case "FOLLOW_UP_REQUESTED":
        return <AlertTriangle className="h-3.5 w-3.5 text-[#935f08]" />;
      default:
        return <Layers className="h-3.5 w-3.5 text-body-mid" />;
    }
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case "ESCALATED":
        return "bg-[#fdf0ed] border-[#f5c2b9] text-[#b92510]";
      case "RESOLVED":
        return "bg-[#ebf6ed] border-[#b8e2c0] text-[#1c6434]";
      case "FOLLOW_UP_REQUESTED":
        return "bg-[#fef8e7] border-[#fae2a0] text-[#935f08]";
      case "DECISION_MADE":
        return "bg-canvas border-hairline text-primary";
      case "POLICY_RETRIEVED":
        return "bg-canvas border-hairline text-primary";
      default:
        return "bg-canvas-soft border-hairline text-body";
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-body-mid text-sm">
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
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-hairline"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  {/* Icon Circle */}
                  <div>
                    <span className="h-8 w-8 rounded-full bg-canvas border border-hairline flex items-center justify-center ring-4 ring-canvas-soft shadow-2xs">
                      {getActionIcon(event.action)}
                    </span>
                  </div>

                  {/* Event Details Box */}
                  <div className="flex-1 min-w-0 bg-canvas border border-hairline rounded-xl p-3 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg border ${getActionBadgeClass(event.action)}`}
                        >
                          {event.action}
                        </span>
                        <span className="text-xs text-body font-medium flex items-center space-x-1">
                          <User className="h-3 w-3 text-body-mid" />
                          <span>{event.actor || "System"}</span>
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-body-mid">
                        {timeString}
                      </span>
                    </div>

                    <p className="text-xs text-body font-sans mt-1 leading-relaxed">
                      {event.details}
                    </p>

                    {/* Meta tags: Ticket ID & Sources */}
                    {(event.ticket_id ||
                      (event.source_ids && event.source_ids.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-hairline text-[11px]">
                        {event.ticket_id && (
                          <span className="bg-canvas-soft border border-hairline text-primary font-mono px-2 py-0.5 rounded-lg font-semibold">
                            {event.ticket_id}
                          </span>
                        )}
                        {event.source_ids &&
                          event.source_ids.map((src, i) => (
                            <span
                              key={i}
                              className="bg-canvas-soft border border-hairline text-body font-mono px-2 py-0.5 rounded-lg"
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
