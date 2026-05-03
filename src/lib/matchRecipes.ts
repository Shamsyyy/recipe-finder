import { normalizeIngredient } from "@/lib/normalizeIngredient";
import type { Recipe, RecipeMatchResult } from "@/lib/types";

const statusPriority: Record<RecipeMatchResult["status"], number> = {
  can_cook: 0,
  almost: 1,
  not_enough: 2,
};

export function matchRecipes(
  userIngredients: string[],
  recipes: Recipe[],
): RecipeMatchResult[] {
  const normalizedUserIngredients = new Set(
    userIngredients
      .map((ingredient) => normalizeIngredient(ingredient))
      .filter(Boolean),
  );

  return recipes
    .map((recipe) => {
      const matchedIngredients: string[] = [];
      const missingEssentialIngredients: string[] = [];
      const missingOptionalIngredients: string[] = [];

      for (const ingredient of recipe.ingredients) {
        const normalizedIngredient = normalizeIngredient(ingredient.name);
        const isMatched = normalizedUserIngredients.has(normalizedIngredient);

        if (isMatched) {
          matchedIngredients.push(ingredient.name);
          continue;
        }

        if (ingredient.isBasic) {
          continue;
        }

        if (ingredient.isEssential) {
          missingEssentialIngredients.push(ingredient.name);
        } else {
          missingOptionalIngredients.push(ingredient.name);
        }
      }

      const essentialIngredients = recipe.ingredients.filter(
        (ingredient) => ingredient.isEssential && !ingredient.isBasic,
      );
      const matchedEssentialCount = essentialIngredients.filter((ingredient) =>
        normalizedUserIngredients.has(normalizeIngredient(ingredient.name)),
      ).length;
      const score =
        essentialIngredients.length === 0
          ? 1
          : matchedEssentialCount / essentialIngredients.length;
      const status = getRecipeStatus(missingEssentialIngredients.length);

      return {
        recipe,
        score,
        matchedIngredients,
        missingEssentialIngredients,
        missingOptionalIngredients,
        status,
      };
    })
    .sort((first, second) => {
      const statusDifference =
        statusPriority[first.status] - statusPriority[second.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return (
        first.recipe.cookingTimeMinutes - second.recipe.cookingTimeMinutes
      );
    });
}

function getRecipeStatus(
  missingEssentialCount: number,
): RecipeMatchResult["status"] {
  if (missingEssentialCount === 0) {
    return "can_cook";
  }

  if (missingEssentialCount <= 2) {
    return "almost";
  }

  return "not_enough";
}
