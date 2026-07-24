import React from "react";
import { Sparkles, Clock, ChefHat, CheckCircle2, AlertTriangle, Lightbulb, RotateCw } from "lucide-react";
import { AIRecipeResponse } from "../types";

interface AIResultPanelProps {
  result: AIRecipeResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function AIResultPanel({
  result,
  isLoading,
  error,
  onRetry
}: AIResultPanelProps) {
  if (isLoading) {
    return (
      <div id="ai-results-panel" className="bg-white rounded-3xl border border-emerald-100 p-8 sm:p-12 text-center shadow-sm space-y-6 animate-fade-in">
        <div className="relative w-20 h-20 mx-auto">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
          {/* Cooking spark icon */}
          <div className="absolute inset-0 flex items-center justify-center text-emerald-600 animate-pulse">
            <ChefHat size={28} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-display font-bold text-xl text-emerald-950">
            Consulting the FoodSaver Chef...
          </h3>
          <p className="text-emerald-700/80 text-sm max-w-md mx-auto">
            Analyzing your pantry ingredients to craft practical recipes and minimize food waste. This will take just a few seconds.
          </p>
        </div>
        {/* Anti-waste factoid/quote while loading */}
        <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 max-w-sm mx-auto text-xs text-emerald-800 italic">
          💡 "Transforming wilted greens into homemade pesto or dry bread into savory breadcrumbs can cut your household waste in half!"
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="ai-results-panel" className="bg-red-50/80 border border-red-100 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle size={26} />
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg text-red-950">
            AI Recipe Call Failed
          </h3>
          <p className="text-red-700/80 text-sm max-w-md mx-auto leading-relaxed">
            {error}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer inline-flex items-center gap-2"
        >
          <RotateCw size={14} />
          Try Again
        </button>
      </div>
    );
  }

  if (!result) return null;

  const hasSubstitutions = result.recipe.substitutions && result.recipe.substitutions.toLowerCase() !== "none";

  return (
    <div id="ai-results-panel" className="bg-white rounded-3xl border border-emerald-100 shadow-md p-6 sm:p-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-emerald-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/10">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-emerald-950">
              Your Custom AI Meal Plan
            </h2>
            <p className="text-xs text-emerald-700/80">
              Optimized for ingredients available in your pantry
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Meal Ideas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center font-mono text-xs font-bold text-emerald-700 bg-emerald-50 w-6 h-6 rounded-full shrink-0">
            1
          </span>
          <h3 className="font-display font-bold text-lg text-emerald-950">
            Three Creative Meal Ideas
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.mealIdeas.map((idea, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-emerald-50 bg-emerald-50/10 hover:bg-emerald-50/20 hover:border-emerald-100 transition-all space-y-2 group"
            >
              <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold font-mono">
                {idx + 1}
              </div>
              <h4 className="font-display font-semibold text-emerald-950 group-hover:text-emerald-700 transition-colors">
                {idea.title}
              </h4>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                {idea.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Step-by-Step Recipe */}
      <div className="space-y-4 border-t border-emerald-50 pt-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center justify-center font-mono text-xs font-bold text-emerald-700 bg-emerald-50 w-6 h-6 rounded-full shrink-0">
            2
          </span>
          <h3 className="font-display font-bold text-lg text-emerald-950">
            Step-by-Step Recipe
          </h3>
        </div>

        <div className="bg-neutral-50/60 rounded-2xl border border-emerald-50/50 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="font-display font-extrabold text-xl text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-600" size={20} />
              {result.recipe.title}
            </h4>
            <span className="text-xs font-medium bg-emerald-100/80 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              Best Fitting Meal
            </span>
          </div>

          {/* Missing Ingredients & Substitutions warning box */}
          {hasSubstitutions && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Ingredient Substitutions & Missing Items
                </h5>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {result.recipe.substitutions}
                </p>
              </div>
            </div>
          )}

          {/* Preparation Steps */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900/60">
              Cooking Instructions
            </h5>
            <ol className="space-y-3">
              {result.recipe.steps.map((step, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <span className="font-mono text-xs font-extrabold text-emerald-700 bg-emerald-100/50 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-emerald-950 leading-relaxed pt-0.5 font-sans">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* SECTION 3: One Creative Leftovers Tip */}
      <div className="space-y-4 border-t border-emerald-50 pt-6">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center font-mono text-xs font-bold text-emerald-700 bg-emerald-50 w-6 h-6 rounded-full shrink-0">
            3
          </span>
          <h3 className="font-display font-bold text-lg text-emerald-950">
            Leftover Optimization Tip
          </h3>
        </div>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white flex items-start gap-4 shadow-sm shadow-emerald-600/10">
          <div className="p-2 bg-white/10 rounded-xl shrink-0 text-amber-300">
            <Lightbulb size={20} className="fill-amber-300/10" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-semibold text-white text-sm">
              Creative Storage & Leftover Hack
            </h4>
            <p className="text-emerald-50 text-xs leading-relaxed">
              {result.leftoversTip}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
