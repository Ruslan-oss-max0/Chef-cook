import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { IngredientsList } from "./components/IngredientsList";
import { RecipeCard } from "./components/RecipeCard";
import { VideoGallery } from "./components/VideoGallery";
import { VideoModal } from "./components/VideoModal";
import { CookingModeModal } from "./components/CookingModeModal";
import { FavoritesList } from "./components/FavoritesList";
import { AuthModal, UserProfile } from "./components/AuthModal";
import { PublishingGuideModal } from "./components/PublishingGuideModal";
import { fetchGeneratedRecipes } from "./services/recipeService";
import {
  auth,
  onAuthStateChanged,
  firebaseSignOut,
  db,
  saveRecipeToFirestore,
  removeRecipeFromFirestore,
  syncPantryToFirestore,
} from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import type { Recipe, CookingVideo } from "./types/recipe";
import {
  Sparkles,
  Utensils,
  Video,
  Bookmark,
  AlertTriangle,
  RotateCcw,
  ChefHat,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function App() {
  const [ingredients, setIngredients] = useState<string[]>(() => {
    const saved = localStorage.getItem("chef_claude_ingredients");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Initial friendly starter ingredients so user can test "Ready for a recipe" immediately
    return ["Chicken breast", "Garlic", "Olive oil", "Pasta"];
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem("chef_claude_recipes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [videos, setVideos] = useState<CookingVideo[]>(() => {
    const saved = localStorage.getItem("chef_claude_videos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem("chef_claude_favorites");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("chef_claude_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPublishGuideOpen, setIsPublishGuideOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "pantry" | "recipes" | "videos" | "favorites"
  >("pantry");
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);
  const [activeCookingRecipe, setActiveCookingRecipe] =
    useState<Recipe | null>(null);
  const [activeVideo, setActiveVideo] = useState<CookingVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const rawProvider = fbUser.providerData?.[0]?.providerId || "";
        const providerType: "google" | "facebook" | "x" | "email" =
          rawProvider.includes("google")
            ? "google"
            : rawProvider.includes("facebook")
            ? "facebook"
            : rawProvider.includes("twitter")
            ? "x"
            : "email";

        const profile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Chef User",
          email: fbUser.email || "",
          provider: providerType,
          avatarUrl:
            fbUser.photoURL ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        };
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync saved recipes from Firestore when logged in
  useEffect(() => {
    if (!user) return;

    try {
      const recipesCol = collection(db, "users", user.id, "savedRecipes");
      const unsubscribe = onSnapshot(recipesCol, (snapshot) => {
        const loaded: Recipe[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.recipeData) {
            loaded.push(data.recipeData as Recipe);
          }
        });
        if (loaded.length > 0) {
          setFavorites(loaded);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Could not attach firestore listener:", err);
    }
  }, [user]);

  // Sync state to localStorage & Firestore
  useEffect(() => {
    localStorage.setItem(
      "chef_claude_ingredients",
      JSON.stringify(ingredients)
    );

    if (user && ingredients.length > 0) {
      syncPantryToFirestore(user.id, ingredients).catch((err) =>
        console.warn("Could not sync pantry to Firestore:", err)
      );
    }
  }, [ingredients, user]);

  useEffect(() => {
    localStorage.setItem("chef_claude_recipes", JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem("chef_claude_videos", JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem("chef_claude_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("chef_claude_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("chef_claude_user");
    }
  }, [user]);

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
  };

  const handleAddIngredient = (ingredientName?: string) => {
    const nameToAdd = (ingredientName || inputValue).trim();
    if (!nameToAdd) return;

    // Avoid duplicate ingredients
    if (
      ingredients.some(
        (item) => item.toLowerCase() === nameToAdd.toLowerCase()
      )
    ) {
      setInputValue("");
      return;
    }

    setIngredients((prev) => [...prev, nameToAdd]);
    setInputValue("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddIngredient();
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearIngredients = () => {
    setIngredients([]);
  };

  const handleGetRecipe = async (options: {
    cuisine: string;
    dietary: string;
    recipeCount: number;
  }) => {
    if (ingredients.length < 4) {
      setError("Please provide at least 4 ingredients to generate recipes.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchGeneratedRecipes(ingredients, options);
      setRecipes(data.recipes);
      setVideos(data.videos);
      setSelectedRecipeIndex(0);
      setActiveTab("recipes");

      // Celebrate generation
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      console.error("Failed to generate recipe:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to generate recipes";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (recipe: Recipe) => {
    setFavorites((prev) => {
      const exists = prev.some((r) => r.id === recipe.id);
      if (exists) {
        if (user) {
          removeRecipeFromFirestore(user.id, recipe.id).catch((err) =>
            console.warn("Could not remove from Firestore:", err)
          );
        }
        return prev.filter((r) => r.id !== recipe.id);
      } else {
        if (user) {
          saveRecipeToFirestore(user.id, recipe).catch((err) =>
            console.warn("Could not save to Firestore:", err)
          );
        }
        return [...prev, recipe];
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col text-stone-800">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recipesCount={recipes.length}
        videosCount={videos.length}
        favoritesCount={favorites.length}
        ingredientsCount={ingredients.length}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenPublishGuide={() => setIsPublishGuideOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Error Notification Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-3 text-sm animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Generation Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Pantry & Ingredients (Core Original Logic + Elevated) */}
        {activeTab === "pantry" && (
          <div className="space-y-6">
            {/* Input Form matching original Chef Claude logic */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 sm:p-7">
              <div className="text-center max-w-lg mx-auto mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  Step 1: Stock Your Pantry
                </span>
                <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-stone-900 mt-2">
                  What ingredients do you have?
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Type at least 4 ingredients to unlock Chef Claude's multi-recipe
                  generator and cooking tutorials.
                </p>
              </div>

              {/* Form Input Section */}
              <form
                onSubmit={handleFormSubmit}
                className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-xl mx-auto"
              >
                <div className="relative w-full">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g. oregano, chicken breast, garlic, pasta..."
                    aria-label="Add ingredient"
                    name="ingredient"
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => setInputValue("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#141413] hover:bg-stone-800 active:bg-black text-[#fafaf8] font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
                >
                  <span className="font-bold text-base leading-none">+</span>
                  <span>Add ingredient</span>
                </button>
              </form>
            </div>

            {/* Ingredients list & "Ready for a recipe?" section */}
            <IngredientsList
              ingredients={ingredients}
              onRemoveIngredient={handleRemoveIngredient}
              onClearIngredients={handleClearIngredients}
              onAddIngredient={(item) => handleAddIngredient(item)}
              onGetRecipe={handleGetRecipe}
              isLoading={isLoading}
            />

            {/* If recipes already generated, show quick preview teaser */}
            {recipes.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#d17557] text-white flex items-center justify-center font-bold">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      {recipes.length} Recipes Ready to View
                    </h4>
                    <p className="text-xs text-stone-600">
                      Top pick: {recipes[0]?.title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("recipes")}
                  className="px-4 py-2 rounded-xl bg-[#141413] hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                >
                  View Recipes →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Multiple AI Generated Recipes */}
        {activeTab === "recipes" && (
          <div className="space-y-6">
            {recipes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">
                  No recipes generated yet
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Add at least 4 ingredients in the Pantry tab and tap "Get a
                  recipe" to generate multiple chef-crafted recipes.
                </p>
                <button
                  onClick={() => setActiveTab("pantry")}
                  className="px-4 py-2 rounded-xl bg-[#d17557] hover:bg-[#c26749] text-white text-xs font-bold transition-colors"
                >
                  Go to Pantry & Ingredients
                </button>
              </div>
            ) : (
              <>
                {/* Recipe Selection Tabs (Multiple generated recipes switcher) */}
                <div className="bg-white rounded-2xl border border-stone-200/90 p-3 shadow-2xs">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Chef Claude created {recipes.length} recipe options for you:
                    </span>
                    <button
                      onClick={() => setActiveTab("pantry")}
                      className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Change ingredients</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {recipes.map((rec, idx) => (
                      <button
                        key={rec.id || idx}
                        type="button"
                        onClick={() => setSelectedRecipeIndex(idx)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          selectedRecipeIndex === idx
                            ? "bg-amber-50/80 border-amber-300 shadow-2xs"
                            : "bg-stone-50/50 border-stone-200/70 hover:bg-stone-100"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 mb-1">
                          <span>Option {idx + 1}</span>
                          <span className="text-stone-500 font-normal">
                            {rec.totalTimeMinutes}m
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                          {rec.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-stone-500">
                          {rec.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Recipe Card */}
                {recipes[selectedRecipeIndex] && (
                  <RecipeCard
                    recipe={recipes[selectedRecipeIndex]}
                    isFavorite={favorites.some(
                      (f) => f.id === recipes[selectedRecipeIndex].id
                    )}
                    onToggleFavorite={handleToggleFavorite}
                    onStartCooking={(rec) => setActiveCookingRecipe(rec)}
                  />
                )}

                {/* Relative Videos quick jump banner */}
                {videos.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-stone-900">
                          Want visual video tutorials?
                        </h5>
                        <p className="text-xs text-stone-600">
                          We found {videos.length} videos of chefs cooking with
                          your ingredients.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("videos")}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                    >
                      Watch Cooking Videos ({videos.length})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 3: Relative Cooking Videos */}
        {activeTab === "videos" && (
          <VideoGallery
            videos={videos}
            ingredients={ingredients}
            onSelectVideo={(vid) => setActiveVideo(vid)}
          />
        )}

        {/* Tab 4: Saved Favorites */}
        {activeTab === "favorites" && (
          <FavoritesList
            favorites={favorites}
            onSelectRecipe={(rec) => {
              // Add to current recipes list if not present, select it, and switch to recipes tab
              if (!recipes.some((r) => r.id === rec.id)) {
                setRecipes((prev) => [rec, ...prev]);
                setSelectedRecipeIndex(0);
              } else {
                const idx = recipes.findIndex((r) => r.id === rec.id);
                setSelectedRecipeIndex(idx >= 0 ? idx : 0);
              }
              setActiveTab("recipes");
            }}
            onRemoveFavorite={(id) => {
              setFavorites((prev) => prev.filter((r) => r.id !== id));
            }}
            onCookRecipe={(rec) => setActiveCookingRecipe(rec)}
          />
        )}
      </main>

      {/* Video Modal Player */}
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />

      {/* Interactive Cooking Mode Modal */}
      <CookingModeModal
        recipe={activeCookingRecipe}
        onClose={() => setActiveCookingRecipe(null)}
      />

      {/* Sign In & Sign Up Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* App Store & Play Market Publishing Guide Modal */}
      <PublishingGuideModal
        isOpen={isPublishGuideOpen}
        onClose={() => setIsPublishGuideOpen(false)}
        appUrl={window.location.origin}
      />

      {/* App Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <img src="/chef.png" alt="Chef logo" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-stone-800">Chef Claude AI</span>
            <span>• Recipe & Cooking Video App</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <button
              type="button"
              onClick={() => setIsPublishGuideOpen(true)}
              className="text-amber-800 hover:text-amber-900 font-semibold underline underline-offset-2"
            >
              App Store & Play Market Guide
            </button>
            <span>•</span>
            <span>Progressive Web App (PWA)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
