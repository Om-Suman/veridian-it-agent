import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function TicketList({
  tickets = [],
  onSelectTicket,
  selectedTicketId,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showHistoricalOnly, setShowHistoricalOnly] = useState(false);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Historical filter
      if (showHistoricalOnly && !t.historical_context) return false;

      // Status filter
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = t.ticket_id?.toLowerCase().includes(q);
        const matchEmp = t.employee_name?.toLowerCase().includes(q);
        const matchSum = t.summary?.toLowerCase().includes(q);
        const matchCat = t.category?.toLowerCase().includes(q);
        if (!matchId && !matchEmp && !matchSum && !matchCat) return false;
      }

      return true;
    });
  }, [tickets, search, statusFilter, showHistoricalOnly]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return "bg-emerald-950/70 border-emerald-500/40 text-emerald-400";
      case "ESCALATED":
        return "bg-rose-950/70 border-rose-500/40 text-rose-400 font-semibold";
      case "WAITING_FOR_EMPLOYEE":
        return "bg-amber-950/70 border-amber-500/40 text-amber-400";
      case "WAITING_FOR_APPROVAL":
      case "WAITING_FOR_FINANCE":
        return "bg-blue-950/70 border-blue-500/40 text-blue-400";
      case "WAITING_FOR_SECURITY":
        return "bg-purple-950/70 border-purple-500/40 text-purple-400";
      case "IN_PROGRESS":
        return "bg-sky-950/70 border-sky-500/40 text-sky-400";
      default:
        return "bg-slate-800 border-slate-700 text-slate-300";
    }
  };

  const getDecisionBadge = (decision) => {
    if (!decision) return null;
    switch (decision) {
      case "RESOLVE":
        return (
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
            RESOLVE
          </span>
        );
      case "FOLLOW_UP":
        return (
          <span className="text-[11px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
            FOLLOW_UP
          </span>
        );
      case "ESCALATE":
        return (
          <span className="text-[11px] font-mono text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/30">
            ESCALATE
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {decision}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Filters & Search Toolbar */}
      <div className="p-4 border-b border-slate-800 bg-slate-850 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ticket ID, employee, category..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="WAITING_FOR_EMPLOYEE">WAITING_FOR_EMPLOYEE</option>
            <option value="WAITING_FOR_APPROVAL">WAITING_FOR_APPROVAL</option>
            <option value="WAITING_FOR_SECURITY">WAITING_FOR_SECURITY</option>
            <option value="WAITING_FOR_FINANCE">WAITING_FOR_FINANCE</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        {/* Historical Context Toggle */}
        <button
          onClick={() => setShowHistoricalOnly(!showHistoricalOnly)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            showHistoricalOnly
              ? "bg-amber-950/60 border-amber-500/40 text-amber-300"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Historical (TK-1042..1051)</span>
        </button>
      </div>

      {/* Ticket Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700">
            <tr>
              <th className="px-4 py-3">Ticket ID</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Decision</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredTickets.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No tickets match the selected filters.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicketId === ticket.ticket_id;
                return (
                  <tr
                    key={ticket.ticket_id}
                    onClick={() =>
                      onSelectTicket && onSelectTicket(ticket.ticket_id)
                    }
                    className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-950/40 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {ticket.ticket_id}
                      {ticket.historical_context && (
                        <span className="ml-1.5 text-[9px] uppercase tracking-wider bg-amber-950 border border-amber-500/30 text-amber-400 px-1 py-0.2 rounded font-sans">
                          Historical
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-white">
                      {ticket.employee_name}
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {ticket.category}
                    </td>
                    <td
                      className="px-4 py-3 max-w-xs truncate text-slate-300"
                      title={ticket.summary}
                    >
                      {ticket.summary}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono border ${getStatusBadge(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getDecisionBadge(ticket.decision)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-400">
                      {ticket.assigned_team || "—"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
