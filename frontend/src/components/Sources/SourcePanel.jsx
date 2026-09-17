import React from "react";
import { X, BookOpen, Clock, Tag, ShieldCheck } from "lucide-react";

export default function SourcePanel({ source, onClose }) {
  if (!source) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#201515]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-canvas border border-hairline rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-soft">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-primary shadow-2xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-primary">
                  {source.id || source.source_id}
                </span>
                <span className="text-body-mid font-semibold">—</span>
                <h3 className="text-ink font-semibold">{source.title}</h3>
              </div>
              <p className="text-xs text-body">
                Authoritative Veridian Corp Policy Document
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-body hover:text-ink p-1.5 rounded-xl hover:bg-canvas-hover transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metadata Banner */}
        <div className="px-6 py-3 bg-canvas-soft border-b border-hairline flex flex-wrap gap-4 text-xs text-body">
          {source.category && (
            <div className="flex items-center space-x-1.5">
              <Tag className="h-3.5 w-3.5 text-body-mid" />
              <span>
                Category:{" "}
                <strong className="text-ink">{source.category}</strong>
              </span>
            </div>
          )}
          {source.last_updated && (
            <div className="flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-body-mid" />
              <span>
                Updated:{" "}
                <strong className="text-ink">{source.last_updated}</strong>
              </span>
            </div>
          )}
          <div className="flex items-center space-x-1.5 text-[#1c6434] font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Official Policy Rule</span>
          </div>
        </div>

        {/* Policy Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="bg-canvas-soft border border-hairline rounded-xl p-4 font-mono text-xs text-ink whitespace-pre-wrap leading-relaxed">
            {source.content || "No policy content available."}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-canvas-soft border-t border-hairline flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-canvas hover:bg-canvas-hover border border-hairline text-ink rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
