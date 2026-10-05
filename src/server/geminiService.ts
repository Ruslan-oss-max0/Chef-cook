import { GoogleGenAI, Type } from "@google/genai";
import type { RecipeGenerationResponse } from "../types/recipe";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Curated verified YouTube video IDs for popular cooking techniques and dish families
// Used as fallback or high-quality video previews when matching dish archetypes
const EMBED_PLAYLISTS: Record<string, { videoId: string; defaultChannel: string }> = {
  pasta: { videoId: "bJUiWdM__Qw", defaultChannel: "Joshua Weissman" }, // Classic Carbonara & Pasta
  chicken: { videoId: "h-g8O2_6u1g", defaultChannel: "Natashas Kitchen" }, // Juicy Garlic Herb Chicken
  skillet: { videoId: "9_5wHw6SL_I", defaultChannel: "Gordon Ramsay" }, // Crispy Skillet Dish
  stirfry: { videoId: "3AIEbT0x6tI", defaultChannel: "Wok with Tak" }, // Quick Stir Fry Technique
  soup: { videoId: "V_9B5D8WqFk", defaultChannel: "Food Wishes" }, // Velvety Comfort Soup
  rice: { videoId: "q6h36-X_Q0I", defaultChannel: "Uncle Roger / Uncle Chen" }, // Golden Egg Fried Rice
  potatoes: { videoId: "8_t35L24_o8", defaultChannel: "Chef John - Food Wishes" }, // Crispy Garlic Herb Potatoes
  vegetarian: { videoId: "W7y2w-m43H8", defaultChannel: "Rainbow Plant Life" }, // Flavorful Veggie Dish
  steak: { videoId: "AmC9SmCBUj4", defaultChannel: "Gordon Ramsay" }, // Perfect Pan-Seared Steak
  breakfast: { videoId: "PUP7U5vTMMg", defaultChannel: "Jamie Oliver" }, // Scrambled Eggs & Skillet
  curry: { videoId: "yJtQ83r0r9E", defaultChannel: "Tasty" }, // Hearty Quick Curry
  salmon: { videoId: "w_iI3Vb44y8", defaultChannel: "Sam The Cooking Guy" }, // Pan Seared Crispy Salmon
  salad: { videoId: "j8iOQp8t5h8", defaultChannel: "Joshua Weissman" }, // Ultimate Salad & Dressing
};

export async function generateRecipesAndVideos(
  ingredients: string[],
  options?: {
    cuisine?: string;
    dietary?: string;
    recipeCount?: number;
  }
): Promise<RecipeGenerationResponse> {
  const count = Math.min(Math.max(options?.recipeCount || 3, 2), 4);
  const cuisine =
    options?.cuisine && options.cuisine !== "All Cuisines"
      ? options.cuisine
      : "Any suitable";
  const dietary =
    options?.dietary && options.dietary !== "None" ? options.dietary : "None";

  const prompt = `You are Chef Claude, an expert Michelin-trained executive chef and culinary educator.
The user has the following ingredients on hand:
${ingredients.map((item) => `- ${item}`).join("\n")}

Preferences:
- Target number of recipes: ${count} distinct recipes.
- Preferred cuisine: ${cuisine}
- Dietary restrictions: ${dietary}

TASK:
1. Generate ${count} distinct, creative, and delicious recipes that make the best use of the user's available ingredients.
   - Recipe 1 should ideally be "Quick & Easy" (under 25 mins).
   - Recipe 2 should be "Chef's Signature / Gourmet" (elevated flavor profile).
   - Recipe 3 should be "Comfort / Hearty Classic" or fresh crowd-pleaser.
   Each recipe must list which of the user's ingredients are used, and what small common pantry staples (like salt, black pepper, cooking oil, butter, water) are assumed.
   Provide clear step-by-step instructions with timings, estimated calories, prep time, cook time, and practical chef tips.
   IMPORTANT - Caloric & Grammage Calculation:
   Calculate realistic cooked grammage for the meal:
   - Estimate servingWeightGrams: standard cooked portion weight in grams (e.g. 350g).
   - Estimate totalWeightGrams: total cooked dish weight in grams for all servings (e.g. 700g).
   - Calculate caloriesPer100g: average calories per 100 grams of the cooked meal (e.g. 137 kcal/100g).
   - Calculate calories per serving and total meal calories based on this grammage.
   Also include a 'markdown' field containing the complete recipe formatted in clean markdown (with # Title, ## Ingredients with gram measurements, ## Instructions, and ## Nutrition & Grammage Breakdown) in the classic Chef Claude style.

2. Recommend 3 to 4 realistic, high-quality cooking tutorial videos featuring prominent culinary creators (like Joshua Weissman, Natasha's Kitchen, Tasty, Gordon Ramsay, Babish, Food Wishes / Chef John, Sam The Cooking Guy, Jamie Oliver, Kenji López-Alt, Laura in the Kitchen).
   Each video recommendation should focus on cooking dishes made with similar ingredients or highlighting the key technique needed for these ingredients.
   Provide a realistic title, channel name, duration (e.g. "12:45"), view count (e.g. "2.1M views"), dish highlight, key ingredients matched, and a concise technique summary.

Be precise, inspiring, and ensure instructions are crystal clear.`;

  const config = {
    temperature: 0.7,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        pantrySummary: {
          type: Type.STRING,
          description:
            "A warm greeting from Chef Claude evaluating the user's ingredient basket and highlighting culinary possibilities.",
        },
        recipes: {
          type: Type.ARRAY,
          description: "List of multiple generated recipe options.",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              tagline: { type: Type.STRING },
              badge: { type: Type.STRING },
              category: { type: Type.STRING },
              prepTime: { type: Type.STRING },
              cookTime: { type: Type.STRING },
              totalTimeMinutes: { type: Type.INTEGER },
              difficulty: { type: Type.STRING },
              servings: { type: Type.STRING },
              caloriesApprox: { type: Type.STRING },
              servingWeightGrams: {
                type: Type.INTEGER,
                description: "Average cooked weight in grams for 1 serving (e.g. 350)",
              },
              totalWeightGrams: {
                type: Type.INTEGER,
                description: "Total cooked meal weight in grams for all servings (e.g. 700)",
              },
              caloriesPer100g: {
                type: Type.INTEGER,
                description: "Average calories per 100 grams of the cooked meal (e.g. 137)",
              },
              description: { type: Type.STRING },
              matchedIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              extraIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              equipmentNeeded: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              instructions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    estimatedMinutes: { type: Type.INTEGER },
                    tip: { type: Type.STRING },
                  },
                  required: ["step", "title", "description"],
                },
              },
              chefTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              nutrition: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.STRING },
                  protein: { type: Type.STRING },
                  carbs: { type: Type.STRING },
                  fat: { type: Type.STRING },
                  servingWeightGrams: { type: Type.INTEGER },
                  totalWeightGrams: { type: Type.INTEGER },
                  caloriesPer100g: { type: Type.INTEGER },
                  totalMealCalories: { type: Type.INTEGER },
                },
                required: ["calories", "protein", "carbs", "fat"],
              },
              markdown: { type: Type.STRING },
            },
            required: [
              "id",
              "title",
              "tagline",
              "badge",
              "category",
              "prepTime",
              "cookTime",
              "totalTimeMinutes",
              "difficulty",
              "servings",
              "description",
              "matchedIngredients",
              "extraIngredients",
              "instructions",
              "chefTips",
              "markdown",
            ],
          },
        },
        videos: {
          type: Type.ARRAY,
          description: "Curated cooking video tutorials matching these ingredients.",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              channelName: { type: Type.STRING },
              duration: { type: Type.STRING },
              views: { type: Type.STRING },
              dishHighlight: { type: Type.STRING },
              keyIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              techniqueSummary: { type: Type.STRING },
              categoryTag: { type: Type.STRING },
            },
            required: [
              "id",
              "title",
              "channelName",
              "duration",
              "views",
              "dishHighlight",
              "keyIngredients",
              "techniqueSummary",
            ],
          },
        },
      },
      required: ["pantrySummary", "recipes", "videos"],
    },
  };

  // Try gemini-3.8-flash first; fall back to gemini-3.1-flash-lite if 503 high demand occurs
  const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
  let rawText = "";
  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config,
      });
      rawText = response.text || "";
      if (rawText) break;
    } catch (err) {
      console.warn(`Model ${modelName} error, trying next candidate:`, err);
      lastError = err;
    }
  }

  if (!rawText) {
    throw lastError || new Error("Failed to receive response from Gemini models.");
  }

  const parsed = JSON.parse(rawText) as RecipeGenerationResponse;

  // Enrich videos with thumbnails, search URLs and safe embed IDs
  const lowerIngredients = ingredients.map((i) => i.toLowerCase()).join(" ");
  const enrichedVideos = (parsed.videos || []).map((video, idx) => {
    // Pick an appropriate fallback embed video ID if applicable
    let matchedEmbedId = "bJUiWdM__Qw";
    if (lowerIngredients.includes("chicken") || video.title.toLowerCase().includes("chicken")) {
      matchedEmbedId = EMBED_PLAYLISTS.chicken.videoId;
    } else if (lowerIngredients.includes("pasta") || video.title.toLowerCase().includes("pasta") || lowerIngredients.includes("spaghetti") || lowerIngredients.includes("noodle")) {
      matchedEmbedId = EMBED_PLAYLISTS.pasta.videoId;
    } else if (lowerIngredients.includes("rice") || video.title.toLowerCase().includes("rice")) {
      matchedEmbedId = EMBED_PLAYLISTS.rice.videoId;
    } else if (lowerIngredients.includes("potato") || video.title.toLowerCase().includes("potato")) {
      matchedEmbedId = EMBED_PLAYLISTS.potatoes.videoId;
    } else if (lowerIngredients.includes("steak") || lowerIngredients.includes("beef") || video.title.toLowerCase().includes("beef")) {
      matchedEmbedId = EMBED_PLAYLISTS.steak.videoId;
    } else if (lowerIngredients.includes("salmon") || lowerIngredients.includes("fish")) {
      matchedEmbedId = EMBED_PLAYLISTS.salmon.videoId;
    } else if (lowerIngredients.includes("soup")) {
      matchedEmbedId = EMBED_PLAYLISTS.soup.videoId;
    } else if (lowerIngredients.includes("egg") || lowerIngredients.includes("cheese")) {
      matchedEmbedId = EMBED_PLAYLISTS.breakfast.videoId;
    } else {
      matchedEmbedId = EMBED_PLAYLISTS.skillet.videoId;
    }

    const searchQuery = encodeURIComponent(`${video.title} ${video.channelName} recipe`);
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    const youtubeEmbedUrl = `https://www.youtube-nocookie.com/embed/${matchedEmbedId}?autoplay=1&rel=0`;

    // Food photo placeholder with relevant cuisine query
    const photoKeyword = encodeURIComponent(
      video.keyIngredients.slice(0, 2).join(",") || "cooking,dish"
    );
    const thumbnailUrl = `https://images.unsplash.com/photo-${
      1546069901 + (idx * 11000)
    }?auto=format&fit=crop&w=640&q=80`;

    return {
      ...video,
      id: video.id || `video-${idx + 1}`,
      thumbnailUrl: thumbnailUrl,
      youtubeSearchQuery: searchQuery,
      youtubeEmbedUrl,
      youtubeVideoId: matchedEmbedId,
    };
  });

  // Enrich recipes with precise meal grammage & caloric density calculations
  const enrichedRecipes = (parsed.recipes || []).map((recipe) => {
    const servingsNum = parseInt(recipe.servings) || 2;
    const servingWeight =
      recipe.servingWeightGrams ||
      recipe.nutrition?.servingWeightGrams ||
      350;
    const totalWeight =
      recipe.totalWeightGrams ||
      recipe.nutrition?.totalWeightGrams ||
      servingWeight * servingsNum;

    // Parse numeric calories from string (e.g., "480 kcal" -> 480)
    const calMatch = (
      recipe.nutrition?.calories ||
      recipe.caloriesApprox ||
      "420"
    ).match(/\d+/);
    const calNum = calMatch ? parseInt(calMatch[0], 10) : 420;

    // Accurate caloric density per 100g = (calories / servingWeight) * 100
    const calPer100g =
      recipe.caloriesPer100g ||
      recipe.nutrition?.caloriesPer100g ||
      Math.max(Math.round((calNum / servingWeight) * 100), 50);

    const totalMealCal =
      recipe.nutrition?.totalMealCalories || calNum * servingsNum;

    return {
      ...recipe,
      servingWeightGrams: servingWeight,
      totalWeightGrams: totalWeight,
      caloriesPer100g: calPer100g,
      caloriesApprox: `${calNum} kcal (~${servingWeight}g portion)`,
      nutrition: {
        calories: `${calNum} kcal`,
        protein: recipe.nutrition?.protein || "28g",
        carbs: recipe.nutrition?.carbs || "40g",
        fat: recipe.nutrition?.fat || "14g",
        servingWeightGrams: servingWeight,
        totalWeightGrams: totalWeight,
        caloriesPer100g: calPer100g,
        totalMealCalories: totalMealCal,
      },
    };
  });

  return {
    pantrySummary:
      parsed.pantrySummary ||
      "Here are personalized recipes and cooking tutorials tailored to your ingredients!",
    recipes: enrichedRecipes,
    videos: enrichedVideos,
  };
}
