import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import ChatWindow from "./components/Chat/ChatWindow";
import Tickets from "./pages/Tickets";
import KnowledgeBase from "./pages/KnowledgeBase";
import AuditLogs from "./pages/AuditLogs";
import SourcePanel from "./components/Sources/SourcePanel";
import TicketDetails from "./components/Tickets/TicketDetails";

import {
  fetchTickets,
  fetchKnowledgeBase,
  fetchAuditTrail,
  fetchEmployees,
  fetchRequests,
  fetchTicketDetails,
} from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);

  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, pData, aData, eData, rData] = await Promise.all([
        fetchTickets(),
        fetchKnowledgeBase(),
        fetchAuditTrail({ limit: 100 }),
        fetchEmployees(),
        fetchRequests(),
      ]);
      setTickets(tData);
      setPolicies(pData);
      setAuditLogs(aData);
      setEmployees(eData);
      setRequests(rData);
      setError(null);
    } catch (err) {
      console.error("Failed to load initial application data:", err);
      setError(
        "Unable to connect to FastAPI backend. Ensure the backend server is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectTicket = async (ticketId) => {
    try {
      const details = await fetchTicketDetails(ticketId);
      setSelectedTicket(details);
    } catch (err) {
      console.error("Failed to load ticket details:", err);
    }
  };

  const handleRunDemo = (req) => {
    setActiveTab("chat");
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Top Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-[#fdf0ed] border border-[#f5c2b9] text-[#b92510] p-4 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3 text-sm">
              <span className="font-semibold">Backend Connection Notice:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 bg-[#b92510] hover:bg-[#a01f0c] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {activeTab === "dashboard" && (
          <Dashboard
            tickets={tickets}
            policies={policies}
            auditLogs={auditLogs}
            requests={requests}
            onRunDemo={handleRunDemo}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "chat" && (
          <ChatWindow
            employees={employees}
            requests={requests}
            onSelectSource={setSelectedSource}
            onSelectTicket={handleSelectTicket}
          />
        )}

        {activeTab === "tickets" && (
          <Tickets
            tickets={tickets}
            onSelectTicket={handleSelectTicket}
            selectedTicketId={selectedTicket?.ticket_id}
          />
        )}

        {activeTab === "knowledge" && <KnowledgeBase policies={policies} />}

        {activeTab === "audit" && (
          <AuditLogs
            auditLogs={auditLogs}
            onRefresh={loadData}
            loading={loading}
          />
        )}
      </main>

      {/* Policy Source Inspection Modal */}
      {selectedSource && (
        <SourcePanel
          source={selectedSource}
          onClose={() => setSelectedSource(null)}
        />
      )}

      {/* Ticket Details Inspection Modal */}
      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSelectSource={setSelectedSource}
        />
      )}
    </div>
  );
}
