import React, { useState } from "react";
import {
  Sparkles,
  X,
  Plus,
  Utensils,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Flame,
  ChefHat,
  Trash2,
} from "lucide-react";

interface IngredientsListProps {
  ingredients: string[];
  onRemoveIngredient: (index: number) => void;
  onClearIngredients: () => void;
  onAddIngredient: (ingredient: string) => void;
  onGetRecipe: (options: {
    cuisine: string;
    dietary: string;
    recipeCount: number;
  }) => void;
  isLoading: boolean;
}

const COMMON_PANTRY_SUGGESTIONS = [
  "Garlic",
  "Olive oil",
  "Chicken breast",
  "Onion",
  "Pasta",
  "Tomatoes",
  "Parmesan cheese",
  "Eggs",
  "Bell pepper",
  "Soy sauce",
  "Butter",
  "Spinach",
  "Lemon",
  "Potatoes",
  "Ground beef",
  "Black pepper",
];

export const IngredientsList: React.FC<IngredientsListProps> = ({
  ingredients,
  onRemoveIngredient,
  onClearIngredients,
  onAddIngredient,
  onGetRecipe,
  isLoading,
}) => {
  const [cuisine, setCuisine] = useState("All Cuisines");
  const [dietary, setDietary] = useState("None");
  const [recipeCount, setRecipeCount] = useState(3);
  const [showPreferences, setShowPreferences] = useState(false);

  const isReady = ingredients.length >= 4;

  const handleGenerate = () => {
    if (!isReady || isLoading) return;
    onGetRecipe({ cuisine, dietary, recipeCount });
  };

  return (
    <section className="space-y-6">
      {/* Current Ingredients Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-800" />
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Ingredients on hand
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {ingredients.length} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            {ingredients.length > 0 && (
              <button
                type="button"
                onClick={onClearIngredients}
                className="text-xs text-stone-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors px-2 py-1 rounded-md hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear list
              </button>
            )}
          </div>
        </div>

        {/* Ingredient Chips Grid */}
        {ingredients.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
            <p className="text-sm font-medium text-stone-600 mb-1">
              Your pantry is currently empty.
            </p>
            <p className="text-xs text-stone-400">
              Type ingredients above or click the quick-add suggestions below.
            </p>
          </div>
        ) : (
          <ul
            className="flex flex-wrap gap-2.5 list-none p-0 m-0"
            aria-live="polite"
          >
            {ingredients.map((ingredient, idx) => (
              <li
                key={`${ingredient}-${idx}`}
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-sm font-medium border border-stone-200/70 transition-all shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{ingredient}</span>
                <button
                  type="button"
                  onClick={() => onRemoveIngredient(idx)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-100 transition-colors ml-0.5"
                  aria-label={`Remove ${ingredient}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Quick-add Suggestions */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 mb-2.5">
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Quick-add common ingredients:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_PANTRY_SUGGESTIONS.filter(
              (item) =>
                !ingredients.some(
                  (ing) => ing.toLowerCase() === item.toLowerCase()
                )
            )
              .slice(0, 10)
              .map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onAddIngredient(item)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-amber-50 text-stone-600 hover:text-amber-900 border border-stone-200/70 hover:border-amber-300 transition-all flex items-center gap-1"
                >
                  <span className="text-stone-400">+</span>
                  <span>{item}</span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Threshold Status Banner (if less than 4 ingredients) */}
      {!isReady && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center gap-3 text-amber-900">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-semibold text-amber-950">
              {4 - ingredients.length} more ingredient
              {4 - ingredients.length > 1 ? "s" : ""} needed to unlock recipes
            </p>
            <p className="text-amber-800/80 text-xs">
              Chef Claude requires at least 4 ingredients to craft balanced,
              Michelin-inspired recipes and culinary video tutorials.
            </p>
          </div>
          <div className="text-xs font-bold bg-amber-200/80 px-2.5 py-1 rounded-lg text-amber-950">
            {ingredients.length}/4
          </div>
        </div>
      )}

      {/* "Ready for a recipe?" Section (Fires when ingredients >= 4) */}
      {isReady && (
        <div className="relative overflow-hidden rounded-2xl bg-[#f0efeb] border-2 border-stone-300/80 shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          {/* Subtle decorative accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-200/40 to-orange-200/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="p-5 sm:p-7 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2 border border-emerald-300/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready to Cook! ({ingredients.length} ingredients on hand)
                </div>
                <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-stone-900 tracking-tight">
                  Ready for a recipe?
                </h3>
                <p className="text-sm text-stone-600 mt-1 max-w-lg">
                  Generate multiple customized recipes from your ingredients,
                  accompanied by curated videos of chefs cooking similar dishes.
                </p>
              </div>

              {/* Primary Call to Action Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="px-3 py-3 rounded-xl border border-stone-300 bg-white/80 hover:bg-white text-stone-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                  title="Customize recipe preferences"
                >
                  <SlidersHorizontal className="w-4 h-4 text-stone-600" />
                  <span className="hidden sm:inline">Options</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="relative group px-6 py-3.5 rounded-xl bg-[#d17557] hover:bg-[#c26749] active:bg-[#b0583b] text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Chef Claude is cooking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
                      <span>Get a recipe</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional Preferences Drawer */}
            {showPreferences && (
              <div className="mt-5 pt-4 border-t border-stone-300/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Cuisine Vibe
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  >
                    <option value="All Cuisines">✨ Chef's Choice (Best Fit)</option>
                    <option value="Italian">🍝 Italian Trattoria</option>
                    <option value="Asian Fusion">🥢 Asian & Wok</option>
                    <option value="Mediterranean">🫒 Mediterranean Fresh</option>
                    <option value="Mexican">🌮 Mexican Fiesta</option>
                    <option value="American Comfort">🍔 Classic American Comfort</option>
                    <option value="French Bistro">🥖 French Bistro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Dietary Focus
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  >
                    <option value="None">Standard / No restrictions</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Gluten-Free">Gluten-Free Friendly</option>
                    <option value="High-Protein">High-Protein Fitness</option>
                    <option value="Low-Carb">Low-Carb / Keto Friendly</option>
                    <option value="Dairy-Free">Dairy-Free</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Recipe Options to Generate
                  </label>
                  <div className="flex items-center gap-2">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setRecipeCount(count)}
                        className={`flex-1 py-1.5 rounded-lg font-bold border transition-colors ${
                          recipeCount === count
                            ? "bg-[#141413] text-white border-[#141413]"
                            : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                        }`}
                      >
                        {count} dishes
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
