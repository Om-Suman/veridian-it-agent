import React, { useState } from "react";
import { Send, User, RotateCcw } from "lucide-react";

export default function InputBox({
  onSend,
  loading,
  employees,
  selectedEmployee,
  setSelectedEmployee,
  onReset,
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="bg-canvas border-t border-hairline p-4">
      {/* Employee Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-body">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-primary" />
          <span className="font-medium">Active Employee:</span>
          <select
            value={selectedEmployee?.email || ""}
            onChange={(e) => {
              const emp = employees.find((x) => x.email === e.target.value);
              if (emp) setSelectedEmployee(emp);
            }}
            className="bg-canvas-soft border border-hairline rounded-xl px-3 py-1 text-ink text-xs focus:outline-none focus:border-primary cursor-pointer"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.email}>
                {emp.name} ({emp.department} - {emp.email})
              </option>
            ))}
          </select>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            type="button"
            className="flex items-center space-x-1 text-body hover:text-ink transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Chat</span>
          </button>
        )}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your IT issue (e.g. 'My laptop won't turn on', 'Need guest Wi-Fi', 'Locked out')..."
          disabled={loading}
          className="flex-1 bg-canvas-soft border border-hairline rounded-xl px-4 py-3 text-sm text-ink placeholder:text-body-mid focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary text-[#fffefb] font-medium px-5 py-3 rounded-xl text-sm flex items-center space-x-2 transition-colors shadow-2xs cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
