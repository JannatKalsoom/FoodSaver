export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string; // Format: YYYY-MM-DD
}

export interface Recipe {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  prepTime: string;
  cookTime: string;
  usedIngredients: string[];
  additionalIngredients?: string[];
  instructions: string[];
  tips?: string;
}

export interface MealIdea {
  title: string;
  description: string;
}

export interface BestFittingRecipe {
  title: string;
  substitutions: string;
  steps: string[];
}

export interface AIRecipeResponse {
  mealIdeas: MealIdea[];
  recipe: BestFittingRecipe;
  leftoversTip: string;
}

export interface LeftoverIdea {
  title: string;
  description: string;
}

export interface LeftoversResponse {
  ideas: LeftoverIdea[];
}

export interface StorageTipItem {
  ingredient: string;
  tip: string;
}

export interface StorageTipsResponse {
  tips: StorageTipItem[];
}
