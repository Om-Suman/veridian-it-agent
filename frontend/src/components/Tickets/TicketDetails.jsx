import React, { useEffect, useState } from "react";
import { X, Ticket, User, Mail, Clock, BookOpen, Activity } from "lucide-react";
import AuditTimeline from "../Audit/AuditTimeline";
import { fetchTicketAudit } from "../../services/api";

export default function TicketDetails({ ticket, onClose, onSelectSource }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    if (ticket?.ticket_id) {
      setLoadingAudit(true);
      fetchTicketAudit(ticket.ticket_id)
        .then((data) => setAuditLogs(data))
        .catch((err) => console.error("Failed to load audit:", err))
        .finally(() => setLoadingAudit(false));
    }
  }, [ticket]);

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#201515]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-canvas border border-hairline rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-soft">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-primary shadow-2xs">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold font-mono text-ink">
                  {ticket.ticket_id}
                </h3>
                {ticket.historical_context && (
                  <span className="text-[10px] uppercase tracking-wider bg-[#fef8e7] border border-[#fae2a0] text-[#935f08] px-2 py-0.5 rounded-lg font-sans font-semibold">
                    Historical Precedent (Context Only)
                  </span>
                )}
              </div>
              <p className="text-xs text-body">{ticket.category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-body hover:text-ink p-1.5 rounded-xl hover:bg-canvas-hover transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Status & Decision Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-canvas-soft border border-hairline p-4 rounded-xl text-xs">
            <div>
              <span className="text-body-mid block mb-1">Status</span>
              <span className="font-mono font-bold text-ink px-2.5 py-1 bg-canvas border border-hairline rounded-lg inline-block">
                {ticket.status}
              </span>
            </div>
            <div>
              <span className="text-body-mid block mb-1">Decision</span>
              <span className="font-mono font-bold text-primary px-2.5 py-1 bg-canvas border border-hairline rounded-lg inline-block">
                {ticket.decision || "NONE"}
              </span>
            </div>
            <div>
              <span className="text-body-mid block mb-1">Assigned Team</span>
              <span className="font-mono text-ink px-2.5 py-1 bg-canvas border border-hairline rounded-lg inline-block">
                {ticket.assigned_team || "IT Support"}
              </span>
            </div>
            <div>
              <span className="text-body-mid block mb-1">Priority</span>
              <span
                className={`font-mono font-semibold px-2.5 py-1 rounded-lg border inline-block ${
                  ticket.priority === "High"
                    ? "text-[#b92510] bg-[#fdf0ed] border-[#f5c2b9]"
                    : "text-ink bg-canvas border-hairline"
                }`}
              >
                {ticket.priority || "Normal"}
              </span>
            </div>
          </div>

          {/* Employee & Timeline Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-canvas-soft border border-hairline rounded-xl p-3.5 space-y-2">
              <div className="text-body font-semibold flex items-center space-x-1.5">
                <User className="h-4 w-4 text-primary" />
                <span>Employee Information</span>
              </div>
              <p className="text-sm font-semibold text-ink">
                {ticket.employee_name}
              </p>
              <p className="text-body font-mono flex items-center space-x-1">
                <Mail className="h-3 w-3 text-body-mid" />
                <span>{ticket.employee_email}</span>
              </p>
            </div>

            <div className="bg-canvas-soft border border-hairline rounded-xl p-3.5 space-y-2">
              <div className="text-body font-semibold flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>Timestamps</span>
              </div>
              <p className="text-body">
                Created:{" "}
                <strong className="font-mono text-ink">
                  {new Date(ticket.created_at).toLocaleString()}
                </strong>
              </p>
              <p className="text-body">
                Updated:{" "}
                <strong className="font-mono text-ink">
                  {new Date(ticket.updated_at).toLocaleString()}
                </strong>
              </p>
            </div>
          </div>

          {/* Issue Summary */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-body mb-2">
              Issue Summary
            </h4>
            <div className="bg-canvas-soft border border-hairline rounded-xl p-4 text-sm text-ink leading-relaxed">
              {ticket.summary}
            </div>
          </div>

          {/* Resolution / Handling Notes */}
          {ticket.resolution_notes && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-body mb-2">
                Resolution & Handling Notes
              </h4>
              <div className="bg-[#fef8e7] border border-[#fae2a0] rounded-xl p-4 text-xs font-mono text-[#935f08] leading-relaxed">
                {ticket.resolution_notes}
              </div>
            </div>
          )}

          {/* Associated Policy Sources */}
          {ticket.sources && ticket.sources.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-body mb-2 flex items-center space-x-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Attributed Policy Sources</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {ticket.sources.map((sourceId, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      onSelectSource &&
                      onSelectSource({
                        id: sourceId,
                        source_id: sourceId,
                        title: sourceId,
                      })
                    }
                    className="bg-canvas hover:bg-canvas-hover border border-hairline hover:border-primary text-primary text-xs px-3 py-1.5 rounded-xl font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>{sourceId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Audit Timeline */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-body mb-3 flex items-center space-x-1.5">
              <Activity className="h-4 w-4 text-primary" />
              <span>Ticket Audit Trail</span>
            </h4>
            {loadingAudit ? (
              <div className="p-4 text-center text-xs text-body-mid animate-pulse">
                Loading ticket audit trail...
              </div>
            ) : (
              <AuditTimeline logs={auditLogs} compact={true} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-canvas-soft border-t border-hairline flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-canvas hover:bg-canvas-hover border border-hairline text-ink rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
