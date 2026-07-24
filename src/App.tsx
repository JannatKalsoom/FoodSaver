import React, { useState, useEffect, useRef } from "react";
import { ChefHat, Leaf, Sparkles, HelpCircle, AlertTriangle, BookOpen, Trash } from "lucide-react";
import { Ingredient, AIRecipeResponse, LeftoversResponse, StorageTipsResponse } from "./types";
import IngredientForm from "./components/IngredientForm";
import IngredientList from "./components/IngredientList";
import AIResultPanel from "./components/AIResultPanel";
import LeftoversPanel from "./components/LeftoversPanel";
import StorageTipsPanel from "./components/StorageTipsPanel";

const STORAGE_KEY = "foodsaver_ai_ingredients";
const RECIPES_STORAGE_KEY = "foodsaver_ai_recipes_v2";
const LEFTOVERS_STORAGE_KEY = "foodsaver_ai_leftovers";
const STORAGE_TIPS_STORAGE_KEY = "foodsaver_ai_storage_tips";

export default function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // AI Recipe generation states
  const [aiResponse, setAiResponse] = useState<AIRecipeResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  
  // Leftovers and Storage tips states
  const [leftovers, setLeftovers] = useState<LeftoversResponse | null>(null);
  const [isGeneratingLeftovers, setIsGeneratingLeftovers] = useState(false);
  const [leftoversError, setLeftoversError] = useState<string | null>(null);
  
  const [storageTips, setStorageTips] = useState<StorageTipsResponse | null>(null);
  const [isGeneratingStorageTips, setIsGeneratingStorageTips] = useState(false);
  const [storageTipsError, setStorageTipsError] = useState<string | null>(null);
  
  // Toasts notification state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" | "error" }[]>([]);
  
  // Scroll target reference for recipe section
  const recipeSectionRef = useRef<HTMLDivElement>(null);
  
  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };
  
  // Load initial data from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Ingredient[];
        setIngredients(parsed);
        setSelectedIds(parsed.map((item) => item.id));
      }
    } catch (e) {
      console.error("Failed to load ingredients from localStorage", e);
    }

    try {
      const storedRecipes = localStorage.getItem(RECIPES_STORAGE_KEY);
      if (storedRecipes) {
        setAiResponse(JSON.parse(storedRecipes));
      }
    } catch (e) {
      console.error("Failed to load recipes from localStorage", e);
    }

    try {
      const storedLeftovers = localStorage.getItem(LEFTOVERS_STORAGE_KEY);
      if (storedLeftovers) {
        setLeftovers(JSON.parse(storedLeftovers));
      }
    } catch (e) {
      console.error("Failed to load leftovers from localStorage", e);
    }

    try {
      const storedStorageTips = localStorage.getItem(STORAGE_TIPS_STORAGE_KEY);
      if (storedStorageTips) {
        setStorageTips(JSON.parse(storedStorageTips));
      }
    } catch (e) {
      console.error("Failed to load storage tips from localStorage", e);
    }
  }, []);

  // Save ingredients to local storage
  const saveIngredientsToStorage = (newIngredients: Ingredient[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIngredients));
    } catch (e) {
      console.error("Failed to save ingredients to localStorage", e);
    }
  };

  // Add new ingredient
  const handleAddIngredient = (newIng: Omit<Ingredient, "id">) => {
    const ingredientWithId: Ingredient = {
      ...newIng,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
    };
    const updated = [ingredientWithId, ...ingredients];
    setIngredients(updated);
    saveIngredientsToStorage(updated);
    setSelectedIds((prev) => [...prev, ingredientWithId.id]);
    showToast(`"${newIng.name}" added to pantry successfully!`, "success");
  };

  // Update existing ingredient
  const handleUpdateIngredient = (id: string, updatedFields: Omit<Ingredient, "id">) => {
    const updated = ingredients.map((item) =>
      item.id === id ? { ...item, ...updatedFields } : item
    );
    setIngredients(updated);
    saveIngredientsToStorage(updated);
    setEditingIngredient(null);
    showToast(`"${updatedFields.name}" updated successfully!`, "success");
  };

  // Delete ingredient
  const handleDeleteIngredient = (id: string) => {
    const target = ingredients.find((item) => item.id === id);
    const updated = ingredients.filter((item) => item.id !== id);
    setIngredients(updated);
    saveIngredientsToStorage(updated);
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    
    if (editingIngredient?.id === id) {
      setEditingIngredient(null);
    }
    if (target) {
      showToast(`"${target.name}" removed from pantry.`, "info");
    }
  };

  // Clear all ingredients (handy for resetting)
  const handleClearAllIngredients = () => {
    if (window.confirm("Are you sure you want to clear your entire pantry list?")) {
      setIngredients([]);
      setSelectedIds([]);
      localStorage.removeItem(STORAGE_KEY);
      setEditingIngredient(null);
      showToast("Pantry inventory has been cleared.", "info");
    }
  };

  // Handle single selection toggle
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Handle master selection toggle
  const handleToggleSelectAll = () => {
    if (selectedIds.length === ingredients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ingredients.map((item) => item.id));
    }
  };

  // Trigger editing mode
  const handleStartEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    // Scroll smoothly to form
    const formElement = document.getElementById("ingredient-form-card");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingIngredient(null);
  };

  // Helper to format error messages cleanly if raw JSON strings are thrown
  const formatErrorMessage = (rawError: string) => {
    if (!rawError) return "An unexpected error occurred.";
    if (typeof rawError === "string" && rawError.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(rawError);
        if (parsed?.error?.message) return parsed.error.message;
        if (parsed?.message) return parsed.message;
      } catch {
        // Fallback if parsing fails
      }
    }
    return rawError;
  };

  // Helper for safe API fetching with resilient non-JSON error handling
  const fetchApiJson = async <T,>(url: string, body: any): Promise<T> => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        if (text.toLowerCase().includes("gemini_api_key")) {
          throw new Error("GEMINI_API_KEY environment variable is missing on Vercel. Please add GEMINI_API_KEY in your Vercel Project Settings -> Environment Variables.");
        }
        throw new Error(`Server returned status ${response.status} (${response.statusText}). Please verify GEMINI_API_KEY is configured in Vercel.`);
      }
      throw new Error("Received an unexpected non-JSON response from server.");
    }

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Server error (${response.status})`;
      if (errorMsg.toLowerCase().includes("gemini_api_key") || errorMsg.toLowerCase().includes("api key")) {
        throw new Error("GEMINI_API_KEY is not configured on Vercel. Go to Vercel -> Project Settings -> Environment Variables and add GEMINI_API_KEY.");
      }
      throw new Error(errorMsg);
    }

    return data as T;
  };

  // Call the backend API route to get AI recipes
  const handleGenerateRecipes = async () => {
    const selectedIngredients = ingredients.filter((item) => selectedIds.includes(item.id));
    if (selectedIngredients.length === 0) return;
    
    setIsGenerating(true);
    setRecipeError(null);

    // Scroll to the recipes section so the user knows analysis has started
    setTimeout(() => {
      recipeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const data = await fetchApiJson<AIRecipeResponse>("/api/recipe", { ingredients: selectedIngredients });
      if (data && data.mealIdeas && data.recipe && data.leftoversTip) {
        setAiResponse(data);
        localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(data));
        showToast("Successfully generated custom recipe ideas!", "success");
      } else {
        throw new Error("Invalid recipe response format returned by AI.");
      }
    } catch (err: any) {
      console.error(err);
      setRecipeError(formatErrorMessage(err.message) || "Something went wrong while speaking with the AI Chef.");
      showToast("Failed to generate recipe ideas.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Call the backend API to get leftovers combination ideas
  const handleGenerateLeftovers = async () => {
    const selectedIngredients = ingredients.filter((item) => selectedIds.includes(item.id));
    if (selectedIngredients.length === 0) return;
    
    setIsGeneratingLeftovers(true);
    setLeftoversError(null);

    // Scroll to the recipes section so the user knows analysis has started
    setTimeout(() => {
      recipeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const data = await fetchApiJson<LeftoversResponse>("/api/leftovers", { ingredients: selectedIngredients });
      if (data && data.ideas) {
        setLeftovers(data);
        localStorage.setItem(LEFTOVERS_STORAGE_KEY, JSON.stringify(data));
        showToast("Successfully generated leftovers combination ideas!", "success");
      } else {
        throw new Error("Invalid leftovers response format returned by AI.");
      }
    } catch (err: any) {
      console.error(err);
      setLeftoversError(formatErrorMessage(err.message) || "Something went wrong while fetching leftover ideas.");
      showToast("Failed to generate leftover ideas.", "error");
    } finally {
      setIsGeneratingLeftovers(false);
    }
  };

  // Call the backend API to get storage tips
  const handleGenerateStorageTips = async () => {
    const selectedIngredients = ingredients.filter((item) => selectedIds.includes(item.id));
    if (selectedIngredients.length === 0) return;
    
    setIsGeneratingStorageTips(true);
    setStorageTipsError(null);

    // Scroll to the recipes section so the user knows analysis has started
    setTimeout(() => {
      recipeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const data = await fetchApiJson<StorageTipsResponse>("/api/storage-tips", { ingredients: selectedIngredients });
      if (data && data.tips) {
        setStorageTips(data);
        localStorage.setItem(STORAGE_TIPS_STORAGE_KEY, JSON.stringify(data));
        showToast("Successfully retrieved storage preservation tips!", "success");
      } else {
        throw new Error("Invalid storage tips response format returned by AI.");
      }
    } catch (err: any) {
      console.error(err);
      setStorageTipsError(formatErrorMessage(err.message) || "Something went wrong while fetching storage tips.");
      showToast("Failed to retrieve storage tips.", "error");
    } finally {
      setIsGeneratingStorageTips(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dynamic Ambient Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-500/10 via-emerald-500/0 to-transparent -z-10 pointer-events-none" />

      {/* Header Banner */}
      <header className="border-b border-emerald-100 bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-600/10">
              <Leaf size={22} className="fill-white/10" />
            </div>
            <div>
              <h1 id="app-title" className="font-display font-extrabold text-lg text-emerald-950 tracking-tight flex items-center gap-1.5">
                FoodSaver AI
              </h1>
              <p className="text-[10px] sm:text-xs font-medium text-emerald-700/80 tracking-wide font-sans leading-none mt-0.5">
                Never waste food again
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/60 border border-emerald-100/50 px-3 py-1.5 rounded-xl font-medium">
              <ChefHat size={14} className="text-emerald-600" />
              <span>Reduce Food Waste</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Dashboard Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Quick Info & Stats Banner */}
          <div className="md:col-span-12 bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
            
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-emerald-950 leading-tight">
                Your Smart Pantry Co-Pilot
              </h2>
              <p className="text-emerald-700/80 text-sm leading-relaxed">
                Keep track of what's in your kitchen, log expiry dates to receive early alerts, and transform remaining ingredients into custom culinary recipes instantly.
              </p>
            </div>

            <div className="flex gap-4 sm:gap-6 shrink-0 border-t lg:border-t-0 border-emerald-50 pt-4 lg:pt-0">
              <div className="text-center bg-emerald-50/30 border border-emerald-100/30 px-5 py-3 rounded-2xl min-w-[100px]">
                <p className="text-2xl font-bold font-display text-emerald-950">{ingredients.length}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700/80">Pantry Items</p>
              </div>
              <div className="text-center bg-amber-50/30 border border-amber-100/30 px-5 py-3 rounded-2xl min-w-[100px]">
                <p className="text-2xl font-bold font-display text-amber-600">
                  {ingredients.filter((item) => {
                    if (!item.expiryDate) return false;
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const exp = new Date(item.expiryDate);
                    exp.setHours(0,0,0,0);
                    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return diff <= 4;
                  }).length}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-700/80">Expires Soon</p>
              </div>
            </div>
          </div>

          {/* Left Column: Form & Waste tips */}
          <div className="md:col-span-4 space-y-6">
            <IngredientForm
              onAddIngredient={handleAddIngredient}
              onUpdateIngredient={handleUpdateIngredient}
              editingIngredient={editingIngredient}
              onCancelEdit={handleCancelEdit}
            />

            {/* Smart Kitchen Advice Cards */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-50 shadow-sm hidden md:block space-y-3">
              <h3 className="font-display font-semibold text-sm text-emerald-950 flex items-center gap-1.5 border-b border-emerald-50 pb-2">
                <HelpCircle size={16} className="text-emerald-600" />
                Anti-Waste Kitchen Tips
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <strong>Freeze surplus veggies:</strong> Chop remaining herbs, celery, or carrots and freeze them in small containers for future stews or stocks.
                  </p>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <strong>Revive bread:</strong> Stale bread can easily become garlic croutons, homemade breadcrumbs, or sweet French toast.
                  </p>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <strong>Store correctly:</strong> Keep bananas, apples, and tomatoes separate from other items as they produce ethylene, which accelerates ripening.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Pantry Inventory list */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-50 pb-3">
              <h2 className="font-display font-bold text-lg text-emerald-950 flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-600" />
                Pantry Inventory
              </h2>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 🤖 Generate Recipe Ideas Button with CSS Tooltip */}
                <div className="relative group">
                  <button
                    onClick={handleGenerateRecipes}
                    disabled={isGenerating || selectedIds.length === 0}
                    id="btn-generate-ai"
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold text-xs rounded-xl shadow-sm transition-all duration-200 active:scale-98 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Thinking...
                      </>
                    ) : (
                      <>
                        🤖 Recipe Ideas
                      </>
                    )}
                  </button>
                  {ingredients.length === 0 ? (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-neutral-900 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                      Add ingredients first
                    </div>
                  ) : selectedIds.length === 0 ? (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-neutral-900 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                      Please select at least one ingredient
                    </div>
                  ) : null}
                </div>

                {/* 🍚 Leftover Ideas Button with CSS Tooltip */}
                <div className="relative group">
                  <button
                    onClick={handleGenerateLeftovers}
                    disabled={isGeneratingLeftovers || selectedIds.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold text-xs rounded-xl shadow-sm transition-all duration-200 active:scale-98 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isGeneratingLeftovers ? (
                      <>
                        <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Thinking...
                      </>
                    ) : (
                      <>
                        🍚 Leftover Ideas
                      </>
                    )}
                  </button>
                  {ingredients.length === 0 ? (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-neutral-900 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                      Add ingredients first
                    </div>
                  ) : selectedIds.length === 0 ? (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-neutral-900 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                      Please select at least one ingredient
                    </div>
                  ) : null}
                </div>

                {/* 💡 Storage Tips Button with CSS Tooltip */}
                <div className="relative group">
                  <button
                    onClick={handleGenerateStorageTips}
                    disabled={isGeneratingStorageTips || selectedIds.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold text-xs rounded-xl shadow-sm transition-all duration-200 active:scale-98 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isGeneratingStorageTips ? (
                      <>
                        <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Thinking...
                      </>
                    ) : (
                      <>
                        💡 Storage Tips
                      </>
                    )}
                  </button>
                  {ingredients.length === 0 ? (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-neutral-900 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                      Add ingredients first
                    </div>
                  ) : selectedIds.length === 0 ? (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-neutral-900 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                      Please select at least one ingredient
                    </div>
                  ) : null}
                </div>

                {ingredients.length > 0 && (
                  <button
                    onClick={handleClearAllIngredients}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 font-medium px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    title="Clear all pantry items"
                  >
                    <Trash size={12} />
                    Clear Pantry
                  </button>
                )}
              </div>
            </div>

            {ingredients.length > 0 && selectedIds.length === 0 && (
              <div id="no-ingredients-selected-warning" className="bg-amber-50 border border-amber-100 text-amber-900 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 font-medium animate-fade-in">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <span>Please select at least one ingredient.</span>
              </div>
            )}

            <IngredientList
              ingredients={ingredients}
              onEdit={handleStartEdit}
              onDelete={handleDeleteIngredient}
              onGenerateRecipes={handleGenerateRecipes}
              isGeneratingRecipes={isGenerating}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
            />
          </div>

        </div>

        {/* AI Recipe Stage Row */}
        <div ref={recipeSectionRef} className="pt-4 space-y-6">
          <AIResultPanel
            result={aiResponse}
            isLoading={isGenerating}
            onRetry={handleGenerateRecipes}
            error={recipeError}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LeftoversPanel
              result={leftovers}
              isLoading={isGeneratingLeftovers}
              error={leftoversError}
              onGenerate={handleGenerateLeftovers}
              disabled={selectedIds.length === 0}
              tooltipText={ingredients.length === 0 ? "Add ingredients first" : "Please select at least one ingredient."}
            />
            <StorageTipsPanel
              result={storageTips}
              isLoading={isGeneratingStorageTips}
              error={storageTipsError}
              onGenerate={handleGenerateStorageTips}
              disabled={selectedIds.length === 0}
              tooltipText={ingredients.length === 0 ? "Add ingredients first" : "Please select at least one ingredient."}
            />
          </div>
        </div>

      </main>

      {/* App Footer */}
      <footer className="bg-white border-t border-emerald-50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-emerald-900/60 font-medium">
            Built by Jannat Mir — Final Project
          </p>
          <p className="text-[11px] text-emerald-800/50">
            © 2026 FoodSaver AI — Empowering households to reduce food waste, cook beautifully, and live sustainably.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-700/40 font-mono">
            <span>Powered by Gemini 3.5 Flash</span>
            <span>•</span>
            <span>Local Storage Active</span>
          </div>
        </div>
      </footer>

      {/* Toast Notifications Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl shadow-lg border text-xs font-medium flex items-center justify-between gap-3 animate-fade-in transition-all ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {toast.type === "success" ? "✨" : toast.type === "error" ? "⚠️" : "💡"}
              </span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-neutral-400 hover:text-neutral-600 font-bold font-sans text-xs shrink-0 p-0.5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
