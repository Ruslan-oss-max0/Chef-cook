export interface RecipeStep {
  step: number;
  title: string;
  description: string;
  estimatedMinutes?: number;
  tip?: string;
}

export interface RecipeNutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  servingWeightGrams?: number;
  totalWeightGrams?: number;
  caloriesPer100g?: number;
  totalMealCalories?: number;
  fiber?: string;
}

export interface Recipe {
  id: string;
  title: string;
  tagline: string;
  badge: string; // e.g. "Chef's Signature", "Quick & Easy (20m)", "Comfort Classic", "Healthy Fit"
  category: string;
  prepTime: string;
  cookTime: string;
  totalTimeMinutes: number;
  difficulty: "Easy" | "Medium" | "Advanced";
  servings: string;
  caloriesApprox: string;
  servingWeightGrams?: number;
  totalWeightGrams?: number;
  caloriesPer100g?: number;
  description: string;
  matchedIngredients: string[];
  extraIngredients: string[];
  equipmentNeeded: string[];
  instructions: RecipeStep[];
  chefTips: string[];
  nutrition: RecipeNutrition;
  markdown: string;
}

export interface CookingVideo {
  id: string;
  title: string;
  channelName: string;
  duration: string;
  views: string;
  thumbnailUrl: string;
  keyIngredients: string[];
  dishHighlight: string;
  youtubeSearchQuery: string;
  youtubeEmbedUrl?: string;
  youtubeVideoId?: string;
  techniqueSummary: string;
}

export interface RecipeGenerationResponse {
  recipes: Recipe[];
  videos: CookingVideo[];
  pantrySummary: string;
}
