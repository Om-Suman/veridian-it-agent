const API_BASE = import.meta.env.VITE_API_URL || "";

export async function sendMessage(payload) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to send message");
  }
  return res.json();
}

export async function fetchTickets(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.historical !== undefined)
    query.append("historical", params.historical);

  const res = await fetch(`${API_BASE}/api/tickets?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function fetchTicketDetails(ticketId) {
  const res = await fetch(`${API_BASE}/api/tickets/${ticketId}`);
  if (!res.ok) throw new Error("Failed to fetch ticket details");
  return res.json();
}

export async function fetchTicketAudit(ticketId) {
  const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/audit`);
  if (!res.ok) throw new Error("Failed to fetch ticket audit log");
  return res.json();
}

export async function fetchTicketSources(ticketId) {
  const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/sources`);
  if (!res.ok) throw new Error("Failed to fetch ticket sources");
  return res.json();
}

export async function fetchKnowledgeBase() {
  const res = await fetch(`${API_BASE}/api/knowledge-base`);
  if (!res.ok) throw new Error("Failed to fetch knowledge base");
  return res.json();
}

export async function fetchPolicyDetails(sourceId) {
  const res = await fetch(
    `${API_BASE}/api/knowledge-base/${encodeURIComponent(sourceId)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch policy details");
  return res.json();
}

export async function fetchAuditTrail(params = {}) {
  const query = new URLSearchParams();
  if (params.ticket_id) query.append("ticket_id", params.ticket_id);
  if (params.limit) query.append("limit", params.limit);

  const res = await fetch(`${API_BASE}/api/audit?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch audit trail");
  return res.json();
}

export async function fetchEmployees() {
  const res = await fetch(`${API_BASE}/api/employees`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export async function fetchRequests() {
  const res = await fetch(`${API_BASE}/api/requests`);
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}
