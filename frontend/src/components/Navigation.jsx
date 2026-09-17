import React from "react";
import {
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
    <header className="bg-canvas border-b border-hairline sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-[#fffefb] font-bold shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-ink">
                  VERIDIAN CORP
                </span>
                <span className="text-[10px] uppercase bg-canvas-soft border border-hairline text-ink-soft font-semibold px-2 py-0.5 rounded-lg tracking-wider">
                  IT Service Agent
                </span>
              </div>
              <p className="text-xs text-body">Internal Support Portal</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-canvas-soft text-ink border border-hairline font-semibold shadow-2xs"
                      : "text-body hover:bg-canvas-soft hover:text-ink"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-primary" : "text-body-mid"}`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Info / Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center text-xs text-body space-x-1.5 bg-canvas-soft px-3 py-1.5 rounded-xl border border-hairline">
              <Clock className="h-3.5 w-3.5 text-body-mid" />
              <span>Context: 21–25 Sep 2026</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#ebf6ed] border border-[#b8e2c0] px-3 py-1.5 rounded-xl text-xs text-[#1c6434]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1c6434] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1c6434]"></span>
              </span>
              <span className="font-medium">Agent Active</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-hairline">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-canvas-soft text-ink border border-hairline font-semibold"
                    : "text-body hover:text-ink"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-body-mid"}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
