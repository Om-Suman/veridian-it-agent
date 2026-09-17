import React, { useState, useEffect, useRef } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import AuditTimeline from "../Audit/AuditTimeline";
import { sendMessage } from "../../services/api";
import {
  Sparkles,
  BookOpen,
  Activity,
  Ticket,
  ChevronRight,
} from "lucide-react";

export default function ChatWindow({
  employees = [],
  requests = [],
  onSelectSource,
  onSelectTicket,
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "agent",
      content:
        "Hello, I am the Veridian Corp Internal IT Service Agent. How can I assist you with your company hardware, access credentials, software, or IT services today?",
      timestamp: new Date().toISOString(),
      decision: null,
      sources: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [recentAudit, setRecentAudit] = useState([]);
  const [activeSources, setActiveSources] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0]);
    }
  }, [employees, selectedEmployee]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "employee",
      employeeName: selectedEmployee?.name || "Employee",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const payload = {
        message: text,
        employee_name: selectedEmployee?.name || "Aditi Sharma",
        employee_email:
          selectedEmployee?.email || "aditi.sharma@veridian-corp.example",
        ticket_id: activeTicket?.ticket_id || null,
      };

      const res = await sendMessage(payload);

      const agentMsg = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        content: res.response,
        decision: res.decision,
        assignedTeam: res.assigned_team,
        ticketId: res.ticket_id,
        ticketStatus: res.ticket_status,
        sources: res.sources,
        historicalContext: res.historical_context,
        requiresFollowUp: res.requires_follow_up,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMsg]);

      if (res.ticket_id) {
        setActiveTicket({
          ticket_id: res.ticket_id,
          status: res.ticket_status,
          decision: res.decision,
          assigned_team: res.assigned_team,
        });
      }

      if (res.sources && res.sources.length > 0) {
        setActiveSources(res.sources);
      }

      if (res.audit_events && res.audit_events.length > 0) {
        setRecentAudit((prev) => [...res.audit_events, ...prev].slice(0, 20));
      }
    } catch (err) {
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: "agent",
        content: `Error processing request: ${err.message}`,
        timestamp: new Date().toISOString(),
        decision: "ESCALATE",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    const matchedEmp = employees.find((e) => e.email === preset.employee_email);
    if (matchedEmp) {
      setSelectedEmployee(matchedEmp);
    }
    handleSendMessage(preset.request_text);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "agent",
        content:
          "Hello, I am the Veridian Corp Internal IT Service Agent. How can I assist you with your company hardware, access credentials, software, or IT services today?",
        timestamp: new Date().toISOString(),
        decision: null,
        sources: [],
      },
    ]);
    setActiveTicket(null);
    setActiveSources([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-7.5rem)]">
      {/* Main Chat Column (2 spans) */}
      <div className="lg:col-span-2 flex flex-col bg-canvas-soft border border-hairline rounded-xl overflow-hidden shadow-2xs">
        {/* Quick Demo Scenarios Bar */}
        <div className="bg-canvas border-b border-hairline p-2.5 overflow-x-auto flex items-center space-x-2 text-xs">
          <span className="text-body font-medium flex items-center space-x-1 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Test Scenarios:</span>
          </span>
          {requests.slice(0, 7).map((req) => (
            <button
              key={req.request_id}
              onClick={() => loadPreset(req)}
              className="bg-canvas-soft hover:bg-canvas-hover border border-hairline hover:border-primary text-ink-soft hover:text-ink px-2.5 py-1 rounded-xl text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer"
              title={`${req.employee_name}: ${req.request_text}`}
            >
              <strong className="text-primary">{req.request_id}</strong>:{" "}
              {req.category.split("/")[0]}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-canvas">
          {messages.map((msg) => (
            <Message
              key={msg.id}
              message={msg}
              onSelectSource={onSelectSource}
              onSelectTicket={onSelectTicket}
            />
          ))}
          {loading && (
            <div className="flex items-center space-x-3 text-xs text-body p-3.5 bg-canvas-soft rounded-xl border border-hairline max-w-md animate-pulse">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>
                Agent orchestrating: NLU Entity Extraction → FAISS RAG Retrieval
                → Policy Engine...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <InputBox
          onSend={handleSendMessage}
          loading={loading}
          employees={employees}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          onReset={handleResetChat}
        />
      </div>

      {/* Right Column: Context, Policy Citations & Live Audit */}
      <div className="flex flex-col space-y-5 overflow-y-auto">
        {/* Active Ticket Card */}
        <div className="bg-canvas-soft border border-hairline rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-body flex items-center space-x-1.5">
              <Ticket className="h-4 w-4 text-primary" />
              <span>Active Ticket Context</span>
            </h3>
            {activeTicket && (
              <span className="text-[11px] font-mono bg-canvas text-primary px-2 py-0.5 rounded-lg border border-hairline font-semibold">
                {activeTicket.ticket_id}
              </span>
            )}
          </div>

          {activeTicket ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-hairline">
                <span className="text-body-mid">Status:</span>
                <span className="font-mono font-semibold text-ink">
                  {activeTicket.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-hairline">
                <span className="text-body-mid">Decision:</span>
                <span className="font-mono font-semibold text-primary">
                  {activeTicket.decision}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-body-mid">Assigned Team:</span>
                <span className="font-mono text-ink">
                  {activeTicket.assigned_team || "IT"}
                </span>
              </div>
              <button
                onClick={() =>
                  onSelectTicket && onSelectTicket(activeTicket.ticket_id)
                }
                className="w-full mt-2.5 py-2 bg-canvas hover:bg-canvas-hover border border-hairline text-ink rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Inspect Ticket Record
              </button>
            </div>
          ) : (
            <p className="text-xs text-body-mid italic py-2">
              No active ticket in current session. Submit an issue to create or
              route a ticket.
            </p>
          )}
        </div>

        {/* Retrieved Policy Evidence Panel */}
        <div className="bg-canvas-soft border border-hairline rounded-xl p-4 shadow-2xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-body mb-3 flex items-center space-x-1.5">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Retrieved Policy Evidence</span>
          </h3>
          {activeSources.length > 0 ? (
            <div className="space-y-2">
              {activeSources.map((src, i) => (
                <div
                  key={i}
                  onClick={() => onSelectSource && onSelectSource(src)}
                  className="bg-canvas hover:bg-canvas-hover border border-hairline hover:border-primary rounded-xl p-3 text-xs cursor-pointer transition-colors group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-primary">
                      {src.id}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-body-mid group-hover:text-ink" />
                  </div>
                  <p className="font-medium text-ink mb-1">{src.title}</p>
                  <p className="text-body-mid line-clamp-2 text-[11px]">
                    {src.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-body-mid italic py-2">
              No policy retrieved yet. Issue queries retrieve policies via FAISS
              semantic search.
            </p>
          )}
        </div>

        {/* Live Audit Log Stream */}
        <div className="bg-canvas-soft border border-hairline rounded-xl p-4 shadow-2xs flex-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-body mb-3 flex items-center space-x-1.5">
            <Activity className="h-4 w-4 text-primary" />
            <span>Live Audit Trail</span>
          </h3>
          <div className="max-h-[300px] overflow-y-auto">
            <AuditTimeline logs={recentAudit} compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
