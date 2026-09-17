import React from "react";
import { X, BookOpen, Clock, Tag, ShieldCheck } from "lucide-react";

export default function SourcePanel({ source, onClose }) {
  if (!source) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-blue-400">
                  {source.id || source.source_id}
                </span>
                <span className="text-slate-300 font-semibold">—</span>
                <h3 className="text-white font-semibold">{source.title}</h3>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative Veridian Corp Policy Document
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metadata Banner */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex flex-wrap gap-4 text-xs text-slate-400">
          {source.category && (
            <div className="flex items-center space-x-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-500" />
              <span>
                Category:{" "}
                <strong className="text-slate-200">{source.category}</strong>
              </span>
            </div>
          )}
          {source.last_updated && (
            <div className="flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>
                Updated:{" "}
                <strong className="text-slate-200">
                  {source.last_updated}
                </strong>
              </span>
            </div>
          )}
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Official Policy Rule</span>
          </div>
        </div>

        {/* Policy Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 font-mono text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
            {source.content || "No policy content available."}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-800/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
