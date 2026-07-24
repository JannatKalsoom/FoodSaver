import React, { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, AlertTriangle, RotateCw, Lightbulb } from "lucide-react";
import { LeftoversResponse } from "../types";

interface LeftoversPanelProps {
  result: LeftoversResponse | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  disabled: boolean;
  tooltipText?: string;
}

export default function LeftoversPanel({
  result,
  isLoading,
  error,
  onGenerate,
  disabled,
  tooltipText
}: LeftoversPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header section - clicking anywhere toggles collapse */}
      <div 
        onClick={handleToggle}
        className="px-5 py-4 flex items-center justify-between cursor-pointer bg-emerald-50/20 select-none hover:bg-emerald-50/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🍚</span>
          <div>
            <h3 className="font-display font-bold text-sm text-emerald-950">
              Leftover combination ideas
            </h3>
            <p className="text-[10px] text-emerald-700/60 font-sans">
              Creative meals from partially used ingredients
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {/* Action button inside header */}
          <div className="relative group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerate();
                setIsOpen(true);
              }}
              disabled={isLoading || disabled}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-100 disabled:text-neutral-400 text-white font-semibold text-xs rounded-lg transition-all active:scale-98 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Thinking...
                </>
              ) : (
                "Get Ideas"
              )}
            </button>
            {disabled && tooltipText && (
              <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1.5 bg-neutral-900 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                {tooltipText}
              </div>
            )}
          </div>

          <button 
            onClick={handleToggle}
            className="p-1 text-emerald-600 hover:bg-emerald-100/50 rounded-lg transition-all"
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-5 border-t border-emerald-50/50 space-y-4">
          {isLoading && (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-emerald-700/80">Asking the chef for leftover makeovers...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 bg-red-50 text-red-800 rounded-xl text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertTriangle size={14} className="text-red-600" />
                {error}
              </span>
              <button 
                onClick={onGenerate}
                className="p-1 hover:bg-red-100 rounded-lg text-red-700 transition-colors"
              >
                <RotateCw size={12} />
              </button>
            </div>
          )}

          {!result && !isLoading && !error && (
            <div className="py-6 text-center text-xs text-emerald-700/60 bg-emerald-50/10 rounded-xl border border-dashed border-emerald-100">
              💡 No leftover ideas generated yet. Click "Get Ideas" above.
            </div>
          )}

          {result && !isLoading && !error && (
            <div className="space-y-3">
              {result.ideas.map((idea, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl border border-emerald-50/80 bg-emerald-50/5 hover:bg-emerald-50/15 transition-all space-y-1.5"
                >
                  <h4 className="font-display font-semibold text-emerald-950 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    {idea.title}
                  </h4>
                  <p className="text-xs text-emerald-800/80 leading-relaxed font-sans">
                    {idea.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
