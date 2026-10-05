import React, { useState, useEffect } from "react";
import type { Recipe } from "../types/recipe";
import { ClaudeRecipeMarkdown } from "./ClaudeRecipeMarkdown";
import {
  Clock,
  Flame,
  Users,
  CheckCircle,
  Bookmark,
  BookmarkCheck,
  ChefHat,
  Volume2,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  Scale,
  Calculator,
  SlidersHorizontal,
} from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onStartCooking: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onStartCooking,
}) => {
  const [viewMode, setViewMode] = useState<"interactive" | "markdown">(
    "interactive"
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Parse baseline grammage & calories
  const servingsNum = parseInt(recipe.servings) || 2;
  const standardServingWeight =
    recipe.servingWeightGrams ||
    recipe.nutrition?.servingWeightGrams ||
    350;
  const totalMealWeight =
    recipe.totalWeightGrams ||
    recipe.nutrition?.totalWeightGrams ||
    standardServingWeight * servingsNum;

  const calMatch = (
    recipe.nutrition?.calories ||
    recipe.caloriesApprox ||
    "420"
  ).match(/\d+/);
  const baseCalories = calMatch ? parseInt(calMatch[0], 10) : 420;

  const calPer100g =
    recipe.caloriesPer100g ||
    recipe.nutrition?.caloriesPer100g ||
    Math.max(Math.round((baseCalories / standardServingWeight) * 100), 50);

  const totalMealCalories =
    recipe.nutrition?.totalMealCalories ||
    Math.round((totalMealWeight * calPer100g) / 100);

  // Interactive custom portion grammage state
  const [portionGrams, setPortionGrams] = useState(standardServingWeight);

  useEffect(() => {
    setPortionGrams(standardServingWeight);
  }, [recipe.id, standardServingWeight]);

  // Dynamically calculated calories & macros based on selected grammage
  const calculatedCalories = Math.round((portionGrams * calPer100g) / 100);
  const portionRatio = portionGrams / standardServingWeight;

  const baseProtein =
    parseInt(recipe.nutrition?.protein?.replace(/\D/g, "") || "28") || 28;
  const baseCarbs =
    parseInt(recipe.nutrition?.carbs?.replace(/\D/g, "") || "40") || 40;
  const baseFat =
    parseInt(recipe.nutrition?.fat?.replace(/\D/g, "") || "14") || 14;

  const calculatedProtein = Math.round(baseProtein * portionRatio);
  const calculatedCarbs = Math.round(baseCarbs * portionRatio);
  const calculatedFat = Math.round(baseFat * portionRatio);

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const narration = `Recipe: ${recipe.title}. ${recipe.tagline}. Estimated time: ${recipe.totalTimeMinutes} minutes. Step 1: ${recipe.instructions[0]?.description || ""}`;
    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden transition-all duration-300">
      {/* Top Header Bar */}
      <div className="p-6 sm:p-7 border-b border-stone-100 bg-gradient-to-b from-stone-50/70 to-white">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-700" />
              {recipe.badge || "Chef Recommended"}
            </span>

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
              {recipe.category || "Main Dish"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Interactive vs Markdown */}
            <div className="inline-flex p-0.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("interactive")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === "interactive"
                    ? "bg-white text-stone-900 shadow-2xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                App Card
              </button>
              <button
                type="button"
                onClick={() => setViewMode("markdown")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  viewMode === "markdown"
                    ? "bg-white text-stone-900 shadow-2xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Markdown</span>
              </button>
            </div>

            {/* Favorite toggle */}
            <button
              type="button"
              onClick={() => onToggleFavorite(recipe)}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-stone-800"
              }`}
              title={isFavorite ? "Remove from saved" : "Save recipe"}
            >
              {isFavorite ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-serif-title font-bold text-stone-900 tracking-tight">
          {recipe.title}
        </h3>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl font-medium">
          {recipe.tagline}
        </p>

        {/* Recipe Meta Pills with Grammage & Calorie Breakdown */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mt-4 pt-3 border-t border-stone-100 text-xs sm:text-sm font-semibold text-stone-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>
              Prep {recipe.prepTime} • Cook {recipe.cookTime}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-stone-500" />
            <span>{recipe.servings} servings</span>
          </div>

          {/* Average calories based on portion grammage */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50/80 border border-orange-200/60 text-orange-950 font-bold">
            <Flame className="w-4 h-4 text-orange-600" />
            <span>~{baseCalories} kcal</span>
            <span className="text-[11px] font-medium text-orange-700">
              ({standardServingWeight}g portion)
            </span>
          </div>

          {/* Caloric Density per 100g */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200/60 text-amber-950 font-bold">
            <Scale className="w-4 h-4 text-amber-700" />
            <span>{calPer100g} kcal/100g</span>
            <span className="text-[11px] font-medium text-amber-700 hidden sm:inline">
              (total ~{totalMealWeight}g)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span
              className={`font-bold ${
                recipe.difficulty === "Easy"
                  ? "text-emerald-700"
                  : recipe.difficulty === "Medium"
                  ? "text-amber-700"
                  : "text-rose-700"
              }`}
            >
              {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Render Markdown View if selected */}
      {viewMode === "markdown" ? (
        <ClaudeRecipeMarkdown
          recipeMarkdown={recipe.markdown}
          recipeTitle={recipe.title}
          onCookMode={() => onStartCooking(recipe)}
        />
      ) : (
        /* Interactive App View */
        <div className="p-6 sm:p-7 space-y-6">
          {/* Ingredients Match Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Ingredients Used */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Your Ingredients Used ({recipe.matchedIngredients.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recipe.matchedIngredients.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300/40"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Extra Pantry Staples Needed */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-stone-500" />
                  Common Pantry Additions ({recipe.extraIngredients.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recipe.extraIngredients.length > 0 ? (
                  recipe.extraIngredients.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-2 py-1 rounded-lg bg-white text-stone-600 border border-stone-200"
                    >
                      + {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-400 italic">
                    None! Uses only your ingredients.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar (Start Cook Mode / Voice) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#faf9f5] border border-stone-200">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-800" />
              <div>
                <p className="text-xs font-bold text-stone-900">
                  Ready to step into the kitchen?
                </p>
                <p className="text-[11px] text-stone-500">
                  Interactive checklist & hands-free timer mode
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSpeak}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                  isSpeaking
                    ? "bg-amber-100 border-amber-300 text-amber-900 animate-pulse"
                    : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? "Pause Narration" : "Listen Overview"}</span>
              </button>

              <button
                type="button"
                onClick={() => onStartCooking(recipe)}
                className="px-4 py-2 rounded-xl bg-[#d17557] hover:bg-[#c26749] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>Start Interactive Cook Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Step-by-Step Instructions Preview */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-2">
              <span>Preparation & Cooking Steps</span>
              <span className="text-xs font-normal text-stone-500">
                ({recipe.instructions.length} steps)
              </span>
            </h4>

            <div className="space-y-3">
              {recipe.instructions.map((step) => (
                <div
                  key={step.step}
                  className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/40 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h5 className="text-sm font-bold text-stone-900">
                          {step.title}
                        </h5>
                        {step.estimatedMinutes && (
                          <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                            ~{step.estimatedMinutes} mins
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        {step.description}
                      </p>
                      {step.tip && (
                        <p className="text-xs text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-lg p-2 mt-2 font-medium">
                          💡 <span className="font-bold">Chef Tip:</span>{" "}
                          {step.tip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chef Secrets & Nutrition Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Chef Tips */}
            <div className="md:col-span-2 p-4 rounded-xl bg-amber-50/50 border border-amber-200/70">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-2 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-amber-800" />
                Chef Claude's Secret Tips
              </h5>
              <ul className="space-y-1.5 list-none p-0 m-0 text-xs text-stone-700">
                {recipe.chefTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutrition & Grammage Calorie Calculator */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-stone-50 to-amber-50/40 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-amber-800" />
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Calories by Grammage
                  </h5>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300/60">
                  {calPer100g} kcal / 100g
                </span>
              </div>

              {/* Quick Portion Selector Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPortionGrams(200)}
                  className={`px-2 py-1 rounded-lg border transition-all ${
                    portionGrams === 200
                      ? "bg-amber-600 text-white border-amber-700 font-bold"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  200g (Light)
                </button>
                <button
                  type="button"
                  onClick={() => setPortionGrams(standardServingWeight)}
                  className={`px-2 py-1 rounded-lg border transition-all ${
                    portionGrams === standardServingWeight
                      ? "bg-amber-600 text-white border-amber-700 font-bold"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {standardServingWeight}g (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setPortionGrams(450)}
                  className={`px-2 py-1 rounded-lg border transition-all ${
                    portionGrams === 450
                      ? "bg-amber-600 text-white border-amber-700 font-bold"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  450g (Large)
                </button>
                <button
                  type="button"
                  onClick={() => setPortionGrams(totalMealWeight)}
                  className={`px-2 py-1 rounded-lg border transition-all ${
                    portionGrams === totalMealWeight
                      ? "bg-amber-600 text-white border-amber-700 font-bold"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {totalMealWeight}g (All)
                </button>
              </div>

              {/* Slider for custom grammage */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-stone-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-stone-500" />
                    <span>Adjust Meal Weight:</span>
                  </span>
                  <span className="font-bold text-stone-900 font-mono">
                    {portionGrams} grams
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max={Math.max(800, totalMealWeight)}
                  step="25"
                  value={portionGrams}
                  onChange={(e) => setPortionGrams(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                />
              </div>

              {/* Calculated dynamic nutrition for this grammage */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center pt-1">
                <div className="bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                  <div className="text-[10px] text-orange-700 uppercase font-semibold">
                    Calories
                  </div>
                  <div className="text-sm font-extrabold text-stone-900">
                    {calculatedCalories}
                    <span className="text-[10px] font-normal text-stone-500 ml-0.5">
                      kcal
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-2xs">
                  <div className="text-[10px] text-emerald-700 uppercase font-semibold">
                    Protein
                  </div>
                  <div className="text-sm font-extrabold text-emerald-800">
                    {calculatedProtein}g
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-2xs">
                  <div className="text-[10px] text-amber-700 uppercase font-semibold">
                    Carbs
                  </div>
                  <div className="text-sm font-extrabold text-amber-800">
                    {calculatedCarbs}g
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-2xs">
                  <div className="text-[10px] text-orange-700 uppercase font-semibold">
                    Fat
                  </div>
                  <div className="text-sm font-extrabold text-orange-800">
                    {calculatedFat}g
                  </div>
                </div>
              </div>

              {/* Benchmark Reference Footer */}
              <div className="pt-1 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
                <span>
                  Standard: <strong>{baseCalories} kcal</strong> ({standardServingWeight}g)
                </span>
                <span>
                  Total Dish: <strong>{totalMealCalories} kcal</strong> ({totalMealWeight}g)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
