import React from "react";
import TicketList from "../components/Tickets/TicketList";

export default function Tickets({ tickets, onSelectTicket, selectedTicketId }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">
            Support Ticket Queue
          </h1>
          <p className="text-xs text-body mt-1">
            Enterprise tickets including live active requests and seeded
            historical precedent tickets (TK-1042..TK-1051).
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-body">
          <span className="h-2 w-2 rounded-full bg-primary"></span>
          <span>
            Total Records:{" "}
            <strong className="text-ink font-mono">{tickets.length}</strong>
          </span>
        </div>
      </div>

      <TicketList
        tickets={tickets}
        onSelectTicket={onSelectTicket}
        selectedTicketId={selectedTicketId}
      />
    </div>
  );
}
