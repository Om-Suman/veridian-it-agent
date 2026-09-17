import React, { useState, useMemo } from "react";
import { Search, Filter, History, ChevronRight } from "lucide-react";

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
        return "bg-[#ebf6ed] border-[#b8e2c0] text-[#1c6434]";
      case "ESCALATED":
        return "bg-[#fdf0ed] border-[#f5c2b9] text-[#b92510] font-semibold";
      case "WAITING_FOR_EMPLOYEE":
      case "WAITING_FOR_APPROVAL":
      case "WAITING_FOR_FINANCE":
      case "WAITING_FOR_SECURITY":
        return "bg-[#fef8e7] border-[#fae2a0] text-[#935f08]";
      case "IN_PROGRESS":
        return "bg-canvas border-hairline text-ink font-medium";
      default:
        return "bg-canvas-soft border-hairline text-body";
    }
  };

  const getDecisionBadge = (decision) => {
    if (!decision) return null;
    switch (decision) {
      case "RESOLVE":
        return (
          <span className="text-[11px] font-mono text-[#1c6434] bg-[#ebf6ed] px-2 py-0.5 rounded-lg border border-[#b8e2c0] font-semibold">
            RESOLVE
          </span>
        );
      case "FOLLOW_UP":
        return (
          <span className="text-[11px] font-mono text-[#935f08] bg-[#fef8e7] px-2 py-0.5 rounded-lg border border-[#fae2a0] font-semibold">
            FOLLOW_UP
          </span>
        );
      case "ESCALATE":
        return (
          <span className="text-[11px] font-mono text-[#b92510] bg-[#fdf0ed] px-2 py-0.5 rounded-lg border border-[#f5c2b9] font-semibold">
            ESCALATE
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono text-body bg-canvas-soft px-2 py-0.5 rounded-lg border border-hairline">
            {decision}
          </span>
        );
    }
  };

  return (
    <div className="bg-canvas-soft border border-hairline rounded-xl overflow-hidden shadow-2xs">
      {/* Filters & Search Toolbar */}
      <div className="p-4 border-b border-hairline bg-canvas flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-body-mid" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ticket ID, employee, category..."
            className="w-full bg-canvas-soft border border-hairline rounded-xl pl-10 pr-3 py-2 text-xs text-ink placeholder:text-body-mid focus:outline-none focus:border-primary"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center space-x-2 text-xs text-body">
          <Filter className="h-3.5 w-3.5 text-body-mid" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-canvas-soft border border-hairline rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-primary cursor-pointer"
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
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
            showHistoricalOnly
              ? "bg-[#fef8e7] border-[#fae2a0] text-[#935f08]"
              : "bg-canvas-soft border-hairline text-body hover:text-ink"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Historical (TK-1042..1051)</span>
        </button>
      </div>

      {/* Ticket Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-ink">
          <thead className="bg-canvas-soft text-body-mid uppercase font-semibold text-[11px] border-b border-hairline tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Ticket ID</th>
              <th className="px-4 py-3.5">Employee</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Summary</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Decision</th>
              <th className="px-4 py-3.5">Team</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline bg-canvas">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-body-mid">
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
                    className={`hover:bg-canvas-hover/60 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#fef8e7]/50 border-l-4 border-l-primary"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-primary whitespace-nowrap">
                      {ticket.ticket_id}
                      {ticket.historical_context && (
                        <span className="ml-1.5 text-[9px] uppercase tracking-wider bg-[#fef8e7] border border-[#fae2a0] text-[#935f08] px-1.5 py-0.5 rounded-md font-sans font-semibold">
                          Historical
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-ink">
                      {ticket.employee_name}
                    </td>
                    <td className="px-4 py-3 text-body whitespace-nowrap">
                      {ticket.category}
                    </td>
                    <td
                      className="px-4 py-3 max-w-xs truncate text-body"
                      title={ticket.summary}
                    >
                      {ticket.summary}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${getStatusBadge(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getDecisionBadge(ticket.decision)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-body">
                      {ticket.assigned_team || "—"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button className="text-body-mid hover:text-ink p-1 rounded-lg hover:bg-canvas-soft transition-colors">
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
