import React from "react";
import type { Recipe } from "../types/recipe";
import { Bookmark, Clock, Users, ArrowRight, Trash2, ChefHat, Sparkles } from "lucide-react";

interface FavoritesListProps {
  favorites: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onRemoveFavorite: (id: string) => void;
  onCookRecipe: (recipe: Recipe) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  onSelectRecipe,
  onRemoveFavorite,
  onCookRecipe,
}) => {
  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <Bookmark className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 mb-1">
          No saved recipes yet
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          When Chef Claude generates delicious recipes, click the bookmark icon
          on any recipe to save it here for quick access.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-serif-title font-bold text-stone-900">
            Saved Favorite Recipes
          </h3>
          <p className="text-xs text-stone-500">
            {favorites.length} recipe{favorites.length > 1 ? "s" : ""} saved in your culinary collection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favorites.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  {recipe.badge || "Saved"}
                </span>

                <button
                  type="button"
                  onClick={() => onRemoveFavorite(recipe.id)}
                  className="text-stone-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4
                onClick={() => onSelectRecipe(recipe)}
                className="text-lg font-serif-title font-bold text-stone-900 hover:text-amber-800 cursor-pointer transition-colors"
              >
                {recipe.title}
              </h4>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                {recipe.tagline}
              </p>

              <div className="flex items-center gap-3 mt-3 text-xs text-stone-500 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  {recipe.totalTimeMinutes} mins
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  {recipe.servings} serv
                </span>
                <span>•</span>
                <span className="font-semibold text-emerald-700">
                  {recipe.difficulty}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onSelectRecipe(recipe)}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
              >
                View Details
              </button>

              <button
                type="button"
                onClick={() => onCookRecipe(recipe)}
                className="text-xs font-bold text-white bg-[#d17557] hover:bg-[#c26749] px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-2xs"
              >
                <span>Cook Mode</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
