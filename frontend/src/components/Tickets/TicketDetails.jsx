import React, { useEffect, useState } from "react";
import {
  X,
  Ticket,
  User,
  Mail,
  Clock,
  Tag,
  BookOpen,
  Activity,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold font-mono text-white">
                  {ticket.ticket_id}
                </h3>
                {ticket.historical_context && (
                  <span className="text-[10px] uppercase tracking-wider bg-amber-950 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded font-sans font-semibold">
                    Historical Precedent (Context Only)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{ticket.category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Status & Decision Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800 p-4 rounded-lg text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Status</span>
              <span className="font-mono font-bold text-slate-200 px-2 py-0.5 bg-slate-800 rounded inline-block">
                {ticket.status}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Decision</span>
              <span className="font-mono font-bold text-blue-400 px-2 py-0.5 bg-blue-950/80 rounded inline-block">
                {ticket.decision || "NONE"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Assigned Team</span>
              <span className="font-mono text-slate-200 px-2 py-0.5 bg-slate-800 rounded inline-block">
                {ticket.assigned_team || "IT Support"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Priority</span>
              <span
                className={`font-mono font-semibold px-2 py-0.5 rounded inline-block ${
                  ticket.priority === "High"
                    ? "text-rose-400 bg-rose-950/60"
                    : "text-slate-300 bg-slate-800"
                }`}
              >
                {ticket.priority || "Normal"}
              </span>
            </div>
          </div>

          {/* Employee & Timeline Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="text-slate-400 font-semibold flex items-center space-x-1.5">
                <User className="h-4 w-4 text-blue-400" />
                <span>Employee Information</span>
              </div>
              <p className="text-sm font-medium text-white">
                {ticket.employee_name}
              </p>
              <p className="text-slate-400 font-mono flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{ticket.employee_email}</span>
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="text-slate-400 font-semibold flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>Timestamps</span>
              </div>
              <p className="text-slate-300">
                Created:{" "}
                <strong className="font-mono text-slate-200">
                  {new Date(ticket.created_at).toLocaleString()}
                </strong>
              </p>
              <p className="text-slate-300">
                Updated:{" "}
                <strong className="font-mono text-slate-200">
                  {new Date(ticket.updated_at).toLocaleString()}
                </strong>
              </p>
            </div>
          </div>

          {/* Issue Summary */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Issue Summary
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-slate-200 leading-relaxed">
              {ticket.summary}
            </div>
          </div>

          {/* Resolution / Handling Notes */}
          {ticket.resolution_notes && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Resolution & Handling Notes
              </h4>
              <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3.5 text-sm text-blue-200/90 leading-relaxed font-mono text-xs">
                {ticket.resolution_notes}
              </div>
            </div>
          )}

          {/* Associated Policy Sources */}
          {ticket.sources && ticket.sources.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <BookOpen className="h-4 w-4 text-blue-400" />
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
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-400 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-bold">{sourceId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Audit Timeline */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Activity className="h-4 w-4 text-blue-400" />
              <span>Ticket Audit Trail</span>
            </h4>
            {loadingAudit ? (
              <div className="p-4 text-center text-xs text-slate-500 animate-pulse">
                Loading ticket audit trail...
              </div>
            ) : (
              <AuditTimeline logs={auditLogs} compact={true} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-800/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
