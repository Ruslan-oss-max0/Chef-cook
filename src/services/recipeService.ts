import type { RecipeGenerationResponse } from "../types/recipe";

export async function fetchGeneratedRecipes(
  ingredients: string[],
  options?: {
    cuisine?: string;
    dietary?: string;
    recipeCount?: number;
  }
): Promise<RecipeGenerationResponse> {
  const response = await fetch("/api/recipes/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ingredients,
      cuisine: options?.cuisine,
      dietary: options?.dietary,
      recipeCount: options?.recipeCount || 3,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.details ||
        errorData.error ||
        `Request failed with status ${response.status}`
    );
  }

  return response.json();
}
