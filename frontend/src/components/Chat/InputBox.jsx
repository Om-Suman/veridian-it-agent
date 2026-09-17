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
    <div className="bg-slate-900 border-t border-slate-800 p-4">
      {/* Employee Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-blue-400" />
          <span>Active Employee:</span>
          <select
            value={selectedEmployee?.email || ""}
            onChange={(e) => {
              const emp = employees.find((x) => x.email === e.target.value);
              if (emp) setSelectedEmployee(emp);
            }}
            className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
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
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition-colors"
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
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium px-5 py-3 rounded-lg text-sm flex items-center space-x-2 transition-colors shadow-lg shadow-blue-600/20"
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
