import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Tag,
  Clock,
  ShieldCheck,
  ChevronRight,
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
          <h1 className="text-xl font-semibold text-ink tracking-tight flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Authoritative Knowledge Base & Policies</span>
          </h1>
          <p className="text-xs text-body mt-1">
            Ground-truth corporate IT policies. The AI service agent is strictly
            grounded on these documents.
          </p>
        </div>
        <div className="text-xs text-body">
          Total Policies:{" "}
          <strong className="text-ink font-mono">{policies.length}</strong>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="bg-canvas-soft border border-hairline rounded-xl p-4 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-body-mid" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search policies by keyword (e.g. 'VPN', 'laptop replacement', 'phishing', 'quota')..."
            className="w-full bg-canvas border border-hairline rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink placeholder:text-body-mid focus:outline-none focus:border-primary"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-primary text-[#fffefb] shadow-2xs"
                : "bg-canvas border border-hairline text-body hover:text-ink"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-[#fffefb] shadow-2xs"
                  : "bg-canvas border border-hairline text-body hover:text-ink"
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
            className="bg-canvas-soft hover:bg-canvas border border-hairline hover:border-primary rounded-xl p-5 flex flex-col justify-between transition-all duration-150 cursor-pointer group shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs bg-canvas text-primary px-2 py-0.5 rounded-lg border border-hairline">
                  {p.source_id}
                </span>
                <span className="text-[10px] text-[#1c6434] flex items-center space-x-1 font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Authoritative</span>
                </span>
              </div>

              <h3 className="text-base font-semibold text-ink group-hover:text-primary transition-colors mb-1">
                {p.title}
              </h3>

              {p.category && (
                <div className="flex items-center space-x-1 text-xs text-body-mid mb-3">
                  <Tag className="h-3 w-3" />
                  <span className="truncate">{p.category}</span>
                </div>
              )}

              <p className="text-xs text-body line-clamp-3 leading-relaxed font-mono bg-canvas p-3 rounded-xl border border-hairline mb-4">
                {p.content}
              </p>
            </div>

            <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs text-body">
              <span className="flex items-center space-x-1 text-body-mid">
                <Clock className="h-3 w-3" />
                <span>{p.last_updated || "Active Policy"}</span>
              </span>
              <span className="text-primary group-hover:translate-x-0.5 transition-transform flex items-center space-x-1 font-medium">
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
