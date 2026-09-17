import React from "react";
import {
  Terminal,
  MessageSquare,
  Ticket,
  BookOpen,
  Activity,
  LayoutDashboard,
  Shield,
  Clock,
} from "lucide-react";

export default function Navigation({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "chat", label: "AI Support Agent", icon: MessageSquare },
    { id: "tickets", label: "Ticket Queue", icon: Ticket },
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
    { id: "audit", label: "Audit Trail", icon: Activity },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  VERIDIAN CORP
                </span>
                <span className="text-xs uppercase bg-blue-900/60 border border-blue-500/30 text-blue-300 font-semibold px-2 py-0.5 rounded">
                  IT Service Agent
                </span>
              </div>
              <p className="text-xs text-slate-400">Internal Support Portal</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Info / Status */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center text-xs text-slate-400 space-x-1 bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              <span>Context: 21–25 Sep 2026</span>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1.5 rounded-md text-xs text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">Agent Active</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
