import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Tag,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function KnowledgeBase({ policies = [], onSelectSource }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = useMemo(() => {
    const set = new Set();
    policies.forEach((p) => {
      if (p.category) {
        p.category.split("/").forEach((c) => set.add(c.trim()));
      }
    });
    return Array.from(set);
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      if (
        selectedCategory !== "ALL" &&
        (!p.category || !p.category.includes(selectedCategory))
      ) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = p.source_id?.toLowerCase().includes(q);
        const matchTitle = p.title?.toLowerCase().includes(q);
        const matchContent = p.content?.toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchContent) return false;
      }
      return true;
    });
  }, [policies, search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span>Authoritative Knowledge Base & Policies</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ground-truth corporate IT policies. The AI service agent is strictly
            grounded on these documents.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Total Policies:{" "}
          <strong className="text-white font-mono">{policies.length}</strong>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search policies by keyword (e.g. 'VPN', 'laptop replacement', 'phishing', 'quota')..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              selectedCategory === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPolicies.map((p) => (
          <div
            key={p.source_id}
            onClick={() =>
              onSelectSource && onSelectSource({ id: p.source_id, ...p })
            }
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-150 cursor-pointer group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                  {p.source_id}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Authoritative</span>
                </span>
              </div>

              <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                {p.title}
              </h3>

              {p.category && (
                <div className="flex items-center space-x-1 text-xs text-slate-400 mb-3">
                  <Tag className="h-3 w-3 text-slate-500" />
                  <span className="truncate">{p.category}</span>
                </div>
              )}

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-mono bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 mb-4">
                {p.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>{p.last_updated || "Active Policy"}</span>
              </span>
              <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                <span>View Rule</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
