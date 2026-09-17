import React from "react";
import AuditTable from "../components/Audit/AuditTable";

export default function AuditLogs({ auditLogs = [], onRefresh, loading }) {
  return (
    <div className="space-y-6">
      <AuditTable logs={auditLogs} onRefresh={onRefresh} loading={loading} />
    </div>
  );
}
