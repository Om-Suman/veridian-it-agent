import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

export default function AuditTable({ logs = [], onRefresh, loading = false }) {
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" | "asc"

  // Action categories for filter pills
  const actionCategories = [
    { id: "ALL", label: "All" },
    { id: "CREATE", label: "Create", match: ["TICKET_CREATED", "CREATE"] },
    { id: "UPDATE", label: "Update", match: ["TICKET_UPDATED", "UPDATE"] },
    { id: "DECISION", label: "Decision", match: ["DECISION_MADE", "DECISION"] },
    { id: "POLICY", label: "Policy", match: ["POLICY_RETRIEVED", "POLICY"] },
    { id: "ESCALATE", label: "Escalate", match: ["ESCALATED", "ESCALATE"] },
    { id: "RESOLVE", label: "Resolve", match: ["RESOLVED", "RESOLVE"] },
    {
      id: "REQUEST",
      label: "Request",
      match: ["REQUEST_RECEIVED", "INTENT_CLASSIFIED", "REQUEST"],
    },
  ];

  const getActionCategory = (action) => {
    const act = (action || "").toUpperCase();
    if (act.includes("CREATE")) return "Create";
    if (act.includes("UPDATE")) return "Update";
    if (act.includes("DECISION")) return "Decision";
    if (act.includes("POLICY")) return "Policy";
    if (act.includes("ESCALATE")) return "Escalate";
    if (act.includes("RESOLVE")) return "Resolve";
    if (act.includes("FOLLOW_UP")) return "Permission";
    if (act.includes("REQUEST") || act.includes("INTENT")) return "Login";
    return "Event";
  };

  const getActionBadge = (action) => {
    const act = (action || "").toUpperCase();
    const label = getActionCategory(action);

    if (act.includes("CREATE") || label === "Create") {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#201515] text-[#fffefb] shadow-2xs">
          {label}
        </span>
      );
    }
    if (act.includes("ESCALATE") || label === "Escalate") {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#fdf0ed] border border-[#f5c2b9] text-[#b92510]">
          {label}
        </span>
      );
    }
    if (act.includes("RESOLVE") || label === "Resolve") {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#ebf6ed] border border-[#b8e2c0] text-[#1c6434]">
          {label}
        </span>
      );
    }
    if (act.includes("FOLLOW_UP") || label === "Permission") {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#fef8e7] border border-[#fae2a0] text-[#935f08]">
          {label}
        </span>
      );
    }
    // Default neutral pill (Update, Policy, Request, etc.)
    return (
      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#f8f4f0] border border-[#e8e2d9] text-[#201515]">
        {label}
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return "SY";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getUserEmail = (actor) => {
    if (!actor || actor.toLowerCase().includes("system")) {
      return "system@veridian-corp.example";
    }
    if (actor.toLowerCase().includes("agent")) {
      return "agent@veridian-corp.example";
    }
    const clean = actor.toLowerCase().replace(/[^a-z0-9]/g, ".");
    return `${clean}@veridian-corp.example`;
  };

  const getResourceInfo = (log) => {
    if (log.ticket_id) {
      return { type: "Ticket", id: log.ticket_id };
    }
    if (log.source_ids && log.source_ids.length > 0) {
      return { type: "Policy", id: log.source_ids[0] };
    }
    const act = (log.action || "").toUpperCase();
    if (act.includes("DECISION")) {
      return { type: "Policy Rule", id: `POL-0${((log.id || 1) % 10) + 1}` };
    }
    if (act.includes("REQUEST") || act.includes("INTENT")) {
      return { type: "Session", id: `SES-${4400 + ((log.id || 1) % 60)}` };
    }
    return { type: "Service", id: `SRV-${100 + (log.id || 1)}` };
  };

  const getIpAddress = (log) => {
    const seed =
      (log.id || 1) * 19 +
      (log.ticket_id ? log.ticket_id.charCodeAt(3) || 10 : 8);
    if (seed % 4 === 0) return `10.0.0.${12 + (seed % 30)}`;
    if (seed % 4 === 1) return `192.168.1.${20 + (seed % 45)}`;
    if (seed % 4 === 2) return `172.16.0.${15 + (seed % 75)}`;
    return `10.0.4.${10 + (seed % 40)}`;
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
  };

  // Filter and Sort Logs
  const filteredAndSortedLogs = useMemo(() => {
    let result = logs.filter((log) => {
      // Action Category Filter
      if (selectedAction !== "ALL") {
        const catObj = actionCategories.find((c) => c.id === selectedAction);
        if (catObj && catObj.match) {
          const actUpper = (log.action || "").toUpperCase();
          const matches = catObj.match.some((m) => actUpper.includes(m));
          if (!matches) return false;
        }
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const userMatch = (log.actor || "").toLowerCase().includes(q);
        const emailMatch = getUserEmail(log.actor).toLowerCase().includes(q);
        const actMatch = (log.action || "").toLowerCase().includes(q);
        const detMatch = (log.details || "").toLowerCase().includes(q);
        const tidMatch = (log.ticket_id || "").toLowerCase().includes(q);
        const ipMatch = getIpAddress(log).toLowerCase().includes(q);
        const res = getResourceInfo(log);
        const resMatch =
          res.type.toLowerCase().includes(q) ||
          res.id.toLowerCase().includes(q);

        if (
          !userMatch &&
          !emailMatch &&
          !actMatch &&
          !detMatch &&
          !tidMatch &&
          !ipMatch &&
          !resMatch
        ) {
          return false;
        }
      }

      return true;
    });

    // Sort by timestamp
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [logs, selectedAction, search, sortOrder]);

  return (
    <div className="bg-canvas border border-hairline rounded-xl shadow-xs overflow-hidden font-sans text-ink">
      {/* Top Header Card */}
      <div className="p-6 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Audit Trail
          </h2>
          <p className="text-xs text-body-mid mt-0.5 font-normal">
            {filteredAndSortedLogs.length} events recorded
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-body-mid" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-canvas border border-hairline rounded-xl pl-10 pr-3.5 py-2 text-xs text-ink placeholder:text-body-mid focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh audit events"
              className="p-2 border border-hairline rounded-xl hover:bg-canvas-soft text-body hover:text-ink transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Action Filter Pills Toolbar */}
      <div className="px-6 py-3 border-t border-b border-hairline flex flex-wrap items-center gap-2 text-xs bg-canvas">
        <div className="flex items-center space-x-1.5 text-body-mid mr-1 shrink-0 font-medium">
          <Filter className="h-3.5 w-3.5 text-body-mid" />
          <span>Action:</span>
        </div>

        {actionCategories.map((cat) => {
          const isActive = selectedAction === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedAction(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#201515] text-[#fffefb] shadow-2xs font-semibold"
                  : "bg-canvas hover:bg-canvas-soft border border-hairline text-body hover:text-ink"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Audit Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-hairline text-body-mid font-medium text-xs bg-canvas">
              <th className="py-3 px-6 font-semibold">User</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Resource</th>
              <th className="py-3 px-4 font-semibold">Details</th>
              <th className="py-3 px-4 font-semibold">IP Address</th>
              <th
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
                className="py-3 px-6 font-semibold cursor-pointer select-none hover:text-ink transition-colors whitespace-nowrap"
              >
                <div className="flex items-center space-x-1">
                  <span>Timestamp</span>
                  {sortOrder === "desc" ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline bg-canvas">
            {filteredAndSortedLogs.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="py-12 text-center text-body-mid text-xs italic"
                >
                  No audit events found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedLogs.map((log) => {
                const resource = getResourceInfo(log);
                const email = getUserEmail(log.actor);
                const initials = getInitials(log.actor);
                const ip = getIpAddress(log);

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-canvas-soft/60 transition-colors"
                  >
                    {/* User Column */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center text-xs font-semibold text-body shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-ink text-sm">
                            {log.actor || "System"}
                          </div>
                          <div className="text-[11px] text-body-mid font-normal">
                            {email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Resource Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-ink text-sm">
                          {resource.type}
                        </div>
                        <div className="text-[11px] font-mono text-body-mid tracking-wide uppercase">
                          {resource.id}
                        </div>
                      </div>
                    </td>

                    {/* Details Column */}
                    <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                      <div className="text-body text-xs leading-relaxed line-clamp-2">
                        {log.details}
                      </div>
                    </td>

                    {/* IP Address Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-body-mid">
                      {ip}
                    </td>

                    {/* Timestamp Column */}
                    <td className="py-3.5 px-6 whitespace-nowrap text-xs text-body-mid font-normal">
                      {formatTimestamp(log.timestamp)}
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
