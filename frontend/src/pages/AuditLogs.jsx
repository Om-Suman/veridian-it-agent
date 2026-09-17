import React, { useState, useMemo } from "react";
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Ticket,
  Shield,
} from "lucide-react";
import AuditTimeline from "../components/Audit/AuditTimeline";

export default function AuditLogs({ auditLogs = [], onRefresh, loading }) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchAct = log.action?.toLowerCase().includes(q);
        const matchDet = log.details?.toLowerCase().includes(q);
        const matchTid = log.ticket_id?.toLowerCase().includes(q);
        const matchActor = log.actor?.toLowerCase().includes(q);
        if (!matchAct && !matchDet && !matchTid && !matchActor) return false;
      }
      return true;
    });
  }, [auditLogs, search, actionFilter]);

  const uniqueActions = useMemo(() => {
    const set = new Set();
    auditLogs.forEach((l) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set);
  }, [auditLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Activity className="h-6 w-6 text-purple-400" />
            <span>Agent Audit Trail & Decision Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Factual chronological record of all agent interactions, policy
            retrieval, decisions, and ticket operations.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search details, actors, ticket IDs..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          <span>Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Actions ({auditLogs.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Timeline Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <AuditTimeline logs={filteredLogs} />
      </div>
    </div>
  );
}
