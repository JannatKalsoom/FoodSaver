import React, { useState, useEffect } from "react";
import { Plus, Check, X, Calendar, Package } from "lucide-react";
import { Ingredient } from "../types";

interface IngredientFormProps {
  onAddIngredient: (ingredient: Omit<Ingredient, "id">) => void;
  onUpdateIngredient: (id: string, ingredient: Omit<Ingredient, "id">) => void;
  editingIngredient: Ingredient | null;
  onCancelEdit: () => void;
}

const COMMON_UNITS = [
  "pieces",
  "grams (g)",
  "kilograms (kg)",
  "liters (l)",
  "milliliters (ml)",
  "cups",
  "spoons",
  "pack(s)",
  "oz",
  "lbs"
];

export default function IngredientForm({
  onAddIngredient,
  onUpdateIngredient,
  editingIngredient,
  onCancelEdit
}: IngredientFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [unit, setUnit] = useState("pieces");
  const [expiryDate, setExpiryDate] = useState("");
  const [errors, setErrors] = useState<{ name?: string; quantity?: string }>({});

  useEffect(() => {
    if (editingIngredient) {
      setName(editingIngredient.name);
      setQuantity(editingIngredient.quantity);
      setUnit(editingIngredient.unit);
      setExpiryDate(editingIngredient.expiryDate || "");
      setErrors({});
    } else {
      resetForm();
    }
  }, [editingIngredient]);

  const resetForm = () => {
    setName("");
    setQuantity("");
    setUnit("pieces");
    setExpiryDate("");
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; quantity?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Ingredient name is required.";
    }
    
    if (quantity === "" || quantity === null || isNaN(Number(quantity))) {
      newErrors.quantity = "Quantity is required.";
    } else if (Number(quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      quantity: Number(quantity),
      unit,
      expiryDate: expiryDate || undefined
    };

    if (editingIngredient) {
      onUpdateIngredient(editingIngredient.id, payload);
    } else {
      onAddIngredient(payload);
      resetForm();
    }
  };

  return (
    <div id="ingredient-form-card" className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 mb-5 border-b border-emerald-50 pb-3">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <Package size={20} />
        </div>
        <h2 className="font-display font-semibold text-lg text-emerald-950">
          {editingIngredient ? "Edit Pantry Item" : "Add Pantry Item"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ingredient Name */}
        <div>
          <label htmlFor="ingredient-name" className="block text-xs font-medium text-emerald-900 mb-1">
            Ingredient Name <span className="text-red-500">*</span>
          </label>
          <input
            id="ingredient-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="e.g. Organic Milk, Avocados, Tomatoes"
            className={`w-full px-4 py-2 rounded-xl text-sm border bg-emerald-50/20 focus:outline-none transition-all ${
              errors.name
                ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-emerald-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1 font-sans">{errors.name}</p>
          )}
        </div>

        {/* Quantity and Unit in same row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ingredient-qty" className="block text-xs font-medium text-emerald-900 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="ingredient-qty"
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setQuantity(val);
                if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
              }}
              placeholder="e.g. 3, 1.5, 500"
              className={`w-full px-4 py-2 rounded-xl text-sm border bg-emerald-50/20 focus:outline-none transition-all ${
                errors.quantity
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-emerald-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              }`}
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1 font-sans">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label htmlFor="ingredient-unit" className="block text-xs font-medium text-emerald-900 mb-1">
              Unit
            </label>
            <select
              id="ingredient-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-2 rounded-xl text-sm border border-emerald-100 bg-emerald-50/20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-emerald-950 appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg fill='%23059669' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>\")", backgroundPosition: "right 10px center", backgroundRepeat: "no-repeat" }}
            >
              {COMMON_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <label htmlFor="ingredient-expiry" className="block text-xs font-medium text-emerald-900 mb-1">
            Expiry Date <span className="text-emerald-500 text-[10px] font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <input
              id="ingredient-expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-emerald-100 bg-emerald-50/20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-emerald-950"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/60 pointer-events-none">
              <Calendar size={16} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {editingIngredient ? (
            <>
              <button
                type="submit"
                id="btn-save-ingredient"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                <Check size={16} />
                Save Changes
              </button>
              <button
                type="button"
                id="btn-cancel-edit"
                onClick={onCancelEdit}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-medium text-sm rounded-xl transition-all active:scale-98 cursor-pointer"
              >
                <X size={16} />
                Cancel
              </button>
            </>
          ) : (
            <button
              type="submit"
              id="btn-add-ingredient"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-emerald-600/10 active:scale-98 cursor-pointer"
            >
              <Plus size={16} />
              Add to Pantry
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
