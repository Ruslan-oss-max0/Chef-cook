import { Router, Request, Response } from "express";
import { generateRecipesAndVideos } from "./geminiService";

export const recipeRouter = Router();

recipeRouter.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

recipeRouter.post("/generate", async (req: Request, res: Response) => {
  try {
    const { ingredients, cuisine, dietary, recipeCount } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({
        error: "Invalid request: 'ingredients' must be an array of strings.",
      });
    }

    const cleanedIngredients = ingredients
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);

    if (cleanedIngredients.length < 4) {
      return res.status(400).json({
        error: "Please provide at least 4 ingredients to generate a recipe.",
      });
    }

    const result = await generateRecipesAndVideos(cleanedIngredients, {
      cuisine: typeof cuisine === "string" ? cuisine : undefined,
      dietary: typeof dietary === "string" ? dietary : undefined,
      recipeCount: typeof recipeCount === "number" ? recipeCount : 3,
    });

    return res.json(result);
  } catch (err: unknown) {
    console.error("Error generating recipe from Gemini:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to generate recipes";
    return res.status(500).json({
      error: "Chef Claude encountered an issue creating your recipes.",
      details: errorMessage,
    });
  }
});
