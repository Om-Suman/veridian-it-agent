import React, { useState, useMemo } from "react";
import { Activity, Search, Filter, RefreshCw } from "lucide-react";
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
          <h1 className="text-xl font-semibold text-ink tracking-tight flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Agent Audit Trail & Decision Logs</span>
          </h1>
          <p className="text-xs text-body mt-1">
            Factual chronological record of all agent interactions, policy
            retrieval, decisions, and ticket operations.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="bg-canvas-soft hover:bg-canvas border border-hairline text-ink px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 transition-colors cursor-pointer shadow-2xs"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`}
          />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-canvas-soft border border-hairline rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-body-mid" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search details, actors, ticket IDs..."
            className="w-full bg-canvas border border-hairline rounded-xl pl-10 pr-3 py-2 text-xs text-ink placeholder:text-body-mid focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-body">
          <Filter className="h-3.5 w-3.5 text-body-mid" />
          <span>Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-canvas border border-hairline rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-primary cursor-pointer"
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
      <div className="bg-canvas-soft border border-hairline rounded-xl p-6 shadow-2xs">
        <AuditTimeline logs={filteredLogs} />
      </div>
    </div>
  );
}
