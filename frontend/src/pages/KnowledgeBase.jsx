import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  Shield,
  Laptop,
  Package,
  Wifi,
  Mail,
  Printer,
  AlertTriangle,
  Layers,
  BookOpen,
  DollarSign,
  ExternalLink,
} from "lucide-react";

export default function KnowledgeBase({ policies = [], onSelectSource }) {
  const [search, setSearch] = useState("");
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Group policies into categories
  const categories = useMemo(() => {
    const map = {};

    policies.forEach((p) => {
      let catName = "General Policies";
      if (p.category) {
        catName = p.category.split("/")[0].trim();
      }
      if (!map[catName]) {
        map[catName] = [];
      }
      map[catName].push(p);
    });

    return map;
  }, [policies]);

  // Expand all categories by default on first load
  useEffect(() => {
    if (
      Object.keys(categories).length > 0 &&
      Object.keys(expandedCategories).length === 0
    ) {
      const initial = {};
      Object.keys(categories).forEach((cat) => {
        initial[cat] = true;
      });
      setExpandedCategories(initial);
    }
  }, [categories]);

  // Set default selected policy
  useEffect(() => {
    if (policies.length > 0 && !selectedPolicyId) {
      setSelectedPolicyId(policies[0].source_id);
    }
  }, [policies, selectedPolicyId]);

  const toggleCategory = (catName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  // Filter policies based on search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    const result = {};

    Object.entries(categories).forEach(([cat, list]) => {
      const matched = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.source_id?.toLowerCase().includes(q) ||
          p.content?.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q),
      );
      if (matched.length > 0) {
        result[cat] = matched;
      }
    });

    return result;
  }, [categories, search]);

  const selectedPolicy = useMemo(() => {
    return (
      policies.find((p) => p.source_id === selectedPolicyId) ||
      policies[0] ||
      null
    );
  }, [policies, selectedPolicyId]);

  const getCategoryIcon = (catName) => {
    const name = (catName || "").toLowerCase();
    if (name.includes("account") || name.includes("auth")) {
      return <Shield className="h-4 w-4 text-primary shrink-0" />;
    }
    if (name.includes("hardware") || name.includes("asset")) {
      return <Laptop className="h-4 w-4 text-primary shrink-0" />;
    }
    if (name.includes("software") || name.includes("licens")) {
      return <Package className="h-4 w-4 text-primary shrink-0" />;
    }
    if (
      name.includes("network") ||
      name.includes("remote") ||
      name.includes("wifi")
    ) {
      return <Wifi className="h-4 w-4 text-primary shrink-0" />;
    }
    if (name.includes("email") || name.includes("communication")) {
      return <Mail className="h-4 w-4 text-primary shrink-0" />;
    }
    if (name.includes("printer") || name.includes("peripheral")) {
      return <Printer className="h-4 w-4 text-primary shrink-0" />;
    }
    if (name.includes("security") || name.includes("incident")) {
      return <AlertTriangle className="h-4 w-4 text-[#b92510] shrink-0" />;
    }
    if (name.includes("finance") || name.includes("expense")) {
      return <DollarSign className="h-4 w-4 text-[#1c6434] shrink-0" />;
    }
    return <Layers className="h-4 w-4 text-body-mid shrink-0" />;
  };

  // Generate structured AI Summary and Key Takeaways
  const policyInsights = useMemo(() => {
    if (!selectedPolicy) return null;
    const sid = (selectedPolicy.source_id || "").toUpperCase();

    const precomputed = {
      "KB-01": {
        summary:
          "Official guidelines for corporate account security and password management. Outlines self-service capabilities and mandatory manual IT unlock procedures once account security thresholds are breached.",
        takeaways: [
          "Employees can reset their own password via the self-service portal at any time.",
          "Accounts automatically lock out after 5 consecutive failed attempts.",
          "Locked accounts require IT support desk manual unlock verification.",
          "No manager or executive approval required for standard credential unlocks.",
        ],
        readTime: "2 min read",
        views: "3,412 views",
      },
      "KB-02": {
        summary:
          "Comprehensive remote access and Virtual Private Network connectivity guidelines. Regulates automatic access eligibility, contractor authorization workflows, and mandatory 90-day credential renewal cycles.",
        takeaways: [
          "Full-time employees receive automatic VPN access upon onboarding without ticket creation.",
          "Contractors strictly require manager approval submitted through the Access Request Form.",
          "All VPN credentials operate on a mandatory 90-day renewal cycle.",
          "Expired credentials require standard renewal; do not escalate to security unless compromised.",
        ],
        readTime: "3 min read",
        views: "2,847 views",
      },
      "KB-03": {
        summary:
          "Hardware lifecycle standards and replacement policy for corporate laptops. Governs hardware tenure eligibility, warranty repair protocols, and advance notice requirements for scheduled hardware swaps.",
        takeaways: [
          "Laptops are eligible for replacement after 3 years of active service or verified hardware failure.",
          "Employees must submit replacement requests at least 2 weeks in advance.",
          "Early replacement prior to 3 years requires Finance sign-off and IT Hardware Lead approval.",
          "Replaced devices must be surrendered to IT asset inventory for certified data sanitization.",
        ],
        readTime: "4 min read",
        views: "4,190 views",
      },
      "KB-04": {
        summary:
          "Corporate software catalog usage and third-party software evaluation policy. Differentiates pre-approved corporate catalog applications from security-restricted commercial or open-source software.",
        takeaways: [
          "Approved catalog software can be self-installed via the Company Portal without IT review.",
          "Non-catalog and third-party software requires formal IT Security review (3–5 business days).",
          "Downloading unapproved commercial executables violates corporate Acceptable Use Policy.",
          "Software requests must specify business justification and departmental cost center.",
        ],
        readTime: "3 min read",
        views: "1,920 views",
      },
      "KB-05": {
        summary:
          "First-line diagnostic and troubleshooting procedures for network office printers. Provides a step-by-step diagnostic sequence to resolve print spooler stalls prior to dispatching physical technicians.",
        takeaways: [
          "Step 1: Check print queue and cancel any stalled local spooler jobs.",
          "Step 2: Restart the local print spooler service via system management.",
          "Step 3: If unresolved, log support ticket including device Asset Tag and office floor location.",
          "Physical hardware jams or paper tray outages should be reported to Facilities.",
        ],
        readTime: "3 min read",
        views: "1,530 views",
      },
      "KB-06": {
        summary:
          "Corporate email storage quotas and mailbox expansion procedures. Outlines baseline mailbox capacity, archival best practices, and managerial approval boundaries for temporary or permanent quota increases.",
        takeaways: [
          "Standard mailbox storage quota is set to 25 GB for all corporate accounts.",
          "Employees should archive emails and remove large attachments before requesting quota increases.",
          "Mailbox quota increases strictly require direct Department Manager approval.",
          "Absolute maximum mailbox cap is 50 GB; larger requirements require corporate cloud archive.",
        ],
        readTime: "2 min read",
        views: "2,110 views",
      },
      "KB-07": {
        summary:
          "Visitor and guest wireless internet access policy across all Veridian Corp offices. Focuses on guest credentials, network isolation from internal resources, and self-service front-desk reception kiosks.",
        takeaways: [
          "Guest Wi-Fi network is strictly isolated from internal corporate databases and intranet.",
          "Access passes are valid for exactly 24 hours from issuance.",
          "Credentials can be generated on-demand at the reception front-desk kiosk.",
          "No IT helpdesk ticket or IT staff approval is required for guest wireless access.",
        ],
        readTime: "2 min read",
        views: "5,280 views",
      },
      "KB-08": {
        summary:
          "Departmental ownership and access provisioning rules for corporate expense reporting software. Clearly defines the division of responsibility between the Finance department and IT Technical Support.",
        takeaways: [
          "Expense software account creation and permissions are owned exclusively by Finance, not IT.",
          "IT does not possess administrative authority to authorize or provision expense accounts.",
          "IT provides support solely for technical login errors and SSO credential authentication.",
          "Access requests must be submitted directly to finance-access@veridian-corp.example.",
        ],
        readTime: "3 min read",
        views: "2,760 views",
      },
      "KB-09": {
        summary:
          "Critical security protocol for reporting phishing emails, malicious links, and suspicious corporate communications. Enforces immediate containment guidelines to safeguard corporate network integrity.",
        takeaways: [
          "Immediately report suspected phishing or malware emails to security@veridian-corp.example.",
          "CRITICAL SAFETY RULE: Never forward suspicious emails to colleagues or general IT support.",
          "Include full email headers and original message as an attachment when possible.",
          "Security Operations containment response initiates within 15 minutes of reporting.",
        ],
        readTime: "4 min read",
        views: "8,940 views",
      },
      "KB-10": {
        summary:
          "Work-from-home ergonomics and remote equipment allowance policy. Establishes remote work eligibility thresholds, peripheral equipment coverage, and equipment ownership retention standards.",
        takeaways: [
          "Employees working remote >= 3 days per week are eligible for monitor and ergonomic chair allowance.",
          "Requires direct Manager sign-off followed by Finance expense approval.",
          "Equipment remains corporate property and must be logged in the IT Asset Registry.",
          "Hybrid employees (< 3 days remote) utilize standard office hot-desking setups.",
        ],
        readTime: "3 min read",
        views: "3,870 views",
      },
      ASSET_MANAGEMENT_POLICY: {
        summary:
          "Enterprise hardware asset refresh cycle and premature depreciation governance. Establishes the standard 4-year lifecycle and strict multi-departmental approval rules for off-cycle hardware upgrades.",
        takeaways: [
          "Standard corporate hardware refresh cycle is 4 years for laptops and 5 years for workstations.",
          "Premature replacement (between 3 and 4 years) requires joint Finance sign-off and IT approval.",
          "Hardware under 3 years old is serviced under manufacturer warranty, not replaced.",
          "All decommissioned assets undergo cryptographic wiping in compliance with NIST standards.",
        ],
        readTime: "4 min read",
        views: "3,150 views",
      },
    };

    if (precomputed[sid]) {
      return precomputed[sid];
    }

    // Dynamic fallback for any additional policies
    const content = selectedPolicy.content || "";
    const sentences = content.split(/[.!?]\s+/).filter(Boolean);
    const summary =
      sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "." : "");
    const takeaways = sentences.slice(0, 4).map((s) => s.trim() + ".");

    return {
      summary:
        summary ||
        "Authoritative ground-truth policy document for Veridian Corp internal operations.",
      takeaways:
        takeaways.length > 0
          ? takeaways
          : [
              "Follow strict Veridian Corp policy procedures.",
              "Contact IT desk for clarification.",
            ],
      readTime: "3 min read",
      views: "1,200 views",
    };
  }, [selectedPolicy]);

  return (
    <div className="bg-canvas border border-hairline rounded-xl shadow-xs overflow-hidden h-[calc(100vh-7.5rem)] flex flex-col md:flex-row font-sans text-ink">
      {/* Left Sidebar (Article Navigation Tree & Search) */}
      <div className="w-full md:w-80 lg:w-88 shrink-0 border-r border-hairline bg-canvas flex flex-col h-full">
        {/* Top Search Bar */}
        <div className="p-4 border-b border-hairline bg-canvas shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-body-mid" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-canvas-soft border border-hairline rounded-xl pl-9 pr-3.5 py-2 text-xs text-ink placeholder:text-body-mid focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Collapsible Category & Article Tree */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {Object.keys(filteredCategories).length === 0 ? (
            <div className="p-6 text-center text-body-mid text-xs italic">
              No matching articles found.
            </div>
          ) : (
            Object.entries(filteredCategories).map(([catName, list]) => {
              const isExpanded = expandedCategories[catName] !== false;

              return (
                <div key={catName} className="select-none">
                  {/* Category Header Row */}
                  <div
                    onClick={() => toggleCategory(catName)}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-canvas-soft text-xs font-semibold text-ink cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-body-mid group-hover:text-ink">
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </span>
                      {getCategoryIcon(catName)}
                      <span className="truncate">{catName}</span>
                    </div>

                    <span className="text-[11px] font-mono text-body-mid font-normal ml-2">
                      {list.length}
                    </span>
                  </div>

                  {/* Sub-articles List */}
                  {isExpanded && (
                    <div className="pl-6 pr-1 py-0.5 space-y-0.5">
                      {list.map((policy) => {
                        const isSelected =
                          selectedPolicy?.source_id === policy.source_id;

                        return (
                          <div
                            key={policy.source_id}
                            onClick={() => {
                              setSelectedPolicyId(policy.source_id);
                            }}
                            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-canvas-soft text-ink font-semibold border-l-2 border-l-primary shadow-2xs"
                                : "text-body hover:bg-canvas-soft/60 hover:text-ink"
                            }`}
                          >
                            <FileText
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isSelected ? "text-primary" : "text-body-mid"
                              }`}
                            />
                            <span className="truncate">{policy.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Content Area (Article Viewer) */}
      <div className="flex-1 bg-canvas overflow-y-auto p-6 md:p-10 flex flex-col justify-between">
        {selectedPolicy ? (
          <div className="max-w-3xl space-y-6">
            {/* Article Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
                {selectedPolicy.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-body-mid mt-2">
                <span className="font-mono font-semibold text-primary">
                  {selectedPolicy.source_id}
                </span>
                <span>•</span>
                <span>Updated {selectedPolicy.last_updated || "Q3 2026"}</span>
                <span>•</span>
                <span>{policyInsights?.readTime || "3 min read"}</span>
                <span>•</span>
                <span>{policyInsights?.views || "2,847 views"}</span>
              </div>
            </div>

            <div className="border-b border-hairline" />

            {/* AI Summary Card */}
            <div className="bg-canvas-soft border border-hairline rounded-xl p-5 shadow-2xs">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-body-mid mb-2">
                AI Summary
              </div>
              <p className="text-xs md:text-sm text-ink leading-relaxed font-normal">
                {policyInsights?.summary}
              </p>
            </div>

            {/* Key Takeaways Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-ink">Key Takeaways</h3>
              <ul className="space-y-2.5">
                {policyInsights?.takeaways.map((takeaway, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2.5 text-xs md:text-sm text-body"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1c6434] mt-2 shrink-0" />
                    <span className="leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Full Article Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-ink">Full Article</h3>
              <div className="bg-canvas-soft/60 border border-hairline rounded-xl p-5 text-xs md:text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">
                {selectedPolicy.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-body-mid text-sm italic">
            Select an article from the left sidebar to view.
          </div>
        )}

        {/* Footer info notice */}
        <div className="mt-12 pt-4 border-t border-hairline flex flex-wrap items-center justify-between text-xs text-body-mid">
          <span>Authoritative Veridian Corp Policy Ground Truth</span>
          <span className="font-mono text-[11px]">
            Grounded Deterministic Service Desk
          </span>
        </div>
      </div>
    </div>
  );
}
