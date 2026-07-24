import React, { useState } from "react";
import { Search, Calendar, Edit2, Trash2, ShieldAlert, Sparkles } from "lucide-react";
import { Ingredient } from "../types";

interface IngredientListProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: string) => void;
  onGenerateRecipes: () => void;
  isGeneratingRecipes: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export default function IngredientList({
  ingredients,
  onEdit,
  onDelete,
  onGenerateRecipes,
  isGeneratingRecipes,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll
}: IngredientListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "expiring" | "good">("all");

  // Helper to calculate days until expiry
  const getExpiryInfo = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);

    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Expired (${Math.abs(diffDays)}d ago)`, color: "text-red-600 bg-red-50 border-red-200", urgency: "critical" };
    } else if (diffDays === 0) {
      return { text: "Expires today!", color: "text-amber-600 bg-amber-50 border-amber-200 animate-pulse", urgency: "high" };
    } else if (diffDays === 1) {
      return { text: "Expires tomorrow", color: "text-amber-600 bg-amber-50 border-amber-200", urgency: "high" };
    } else if (diffDays <= 4) {
      return { text: `Expires in ${diffDays} days`, color: "text-orange-600 bg-orange-50 border-orange-200", urgency: "medium" };
    } else {
      return { text: `Expires in ${diffDays} days`, color: "text-emerald-700 bg-emerald-50 border-emerald-100", urgency: "low" };
    }
  };

  // Filter criteria
  const filteredIngredients = ingredients.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const expiryInfo = getExpiryInfo(item.expiryDate);

    if (filterType === "expiring") {
      // Expiry info exists and urgency is critical, high or medium (days <= 4)
      return matchesSearch && expiryInfo && (expiryInfo.urgency === "critical" || expiryInfo.urgency === "high" || expiryInfo.urgency === "medium");
    } else if (filterType === "good") {
      return matchesSearch && (!expiryInfo || expiryInfo.urgency === "low");
    }

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Quick Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search pantry ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-emerald-100 rounded-xl bg-emerald-50/20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-emerald-950"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600/60 pointer-events-none">
            <Search size={16} />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "border-emerald-100 hover:bg-emerald-50 text-emerald-700"
            }`}
          >
            All ({ingredients.length})
          </button>
          <button
            onClick={() => setFilterType("expiring")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              filterType === "expiring"
                ? "bg-amber-600 border-amber-600 text-white"
                : "border-emerald-100 hover:bg-emerald-50 text-emerald-700"
            }`}
          >
            Expiring Soon / Expired (
            {ingredients.filter((item) => {
              const exp = getExpiryInfo(item.expiryDate);
              return exp && (exp.urgency === "critical" || exp.urgency === "high" || exp.urgency === "medium");
            }).length}
            )
          </button>

          {ingredients.length > 0 && (
            <>
              <div className="h-4 w-px bg-emerald-100 mx-1 hidden sm:block" />
              <button
                onClick={onToggleSelectAll}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer border border-emerald-100/50"
              >
                {selectedIds.length === ingredients.length ? "Deselect All" : "Select All"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main List Rendering */}
      {filteredIngredients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-emerald-50 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <ShieldAlert size={28} />
          </div>
          {ingredients.length === 0 ? (
            <>
              <h3 className="font-display font-semibold text-emerald-950 text-base mb-1">
                Your pantry is empty
              </h3>
              <p className="text-emerald-700/70 text-sm max-w-sm mx-auto">
                Your pantry is empty — add your first ingredient!
              </p>
            </>
          ) : (
            <>
              <h3 className="font-display font-semibold text-emerald-950 text-base mb-1">
                No matching ingredients
              </h3>
              <p className="text-emerald-700/70 text-sm max-w-sm mx-auto">
                No pantry items matched "{searchTerm}". Try refining your search query.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIngredients.map((item) => {
            const expiry = getExpiryInfo(item.expiryDate);

            return (
              <div
                key={item.id}
                id={`ingredient-card-${item.id}`}
                className="bg-white rounded-2xl p-5 border border-emerald-50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => onToggleSelect(item.id)}
                        id={`checkbox-ingredient-${item.id}`}
                        className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                      />
                      <label 
                        htmlFor={`checkbox-ingredient-${item.id}`}
                        className="font-display font-semibold text-emerald-950 text-base break-words line-clamp-2 cursor-pointer select-none"
                      >
                        {item.name}
                      </label>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 rounded-lg transition-all cursor-pointer"
                        title="Edit ingredient"
                        id={`btn-edit-${item.id}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-all cursor-pointer"
                        title="Delete ingredient"
                        id={`btn-delete-${item.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 text-emerald-900 mb-3 font-medium">
                    <span className="text-xl font-bold font-display">{item.quantity}</span>
                    <span className="text-xs text-emerald-700/80">{item.unit}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-50/50 flex flex-col gap-2">
                  {expiry ? (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border w-fit ${expiry.color}`}>
                      <Calendar size={12} />
                      <span>{expiry.text}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-100 bg-gray-50/50 text-gray-500 w-fit">
                      <Calendar size={12} />
                      <span>No expiry date</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Action to Generate Recipes with AI */}
      {ingredients.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Sparkles size={20} className="text-amber-300 fill-amber-300/30" />
              Need Recipe Inspiration?
            </h3>
            <p className="text-emerald-50 text-sm max-w-xl">
              {selectedIds.length === 0 ? (
                <span className="text-amber-200 font-medium">Please select at least one ingredient from the list above to generate custom AI recipes!</span>
              ) : (
                <span>Let FoodSaver AI analyze your {selectedIds.length} selected pantry item{selectedIds.length > 1 ? "s" : ""} and cook up custom recipe ideas to minimize food waste.</span>
              )}
            </p>
          </div>
          <button
            onClick={onGenerateRecipes}
            disabled={isGeneratingRecipes || selectedIds.length === 0}
            id="btn-generate-recipes"
            className="px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 disabled:bg-white/40 disabled:text-emerald-900/40 font-semibold text-sm rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            {isGeneratingRecipes ? (
              <>
                <svg className="animate-spin h-4 w-4 text-emerald-800" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing selection...
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-amber-500 animate-pulse" />
                Generate AI Recipes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
