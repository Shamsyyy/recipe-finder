import { normalizeIngredient } from "@/lib/normalizeIngredient";
import type { Recipe, RecipeMatchResult } from "@/lib/types";

const statusPriority: Record<RecipeMatchResult["status"], number> = {
  can_cook: 0,
  almost: 1,
  not_enough: 2,
};

const basicIngredientNames = new Set([
  "соль",
  "перец",
  "вода",
  "масло",
  "растительное масло",
  "специи",
]);

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
      const requiredIngredients = recipe.ingredients.filter(
        (ingredient) => !isBasicIngredient(ingredient),
      );
      let partialMatchesCount = 0;

      for (const ingredient of requiredIngredients) {
        const normalizedIngredient = normalizeIngredient(ingredient.name);
        const isMatched = normalizedUserIngredients.has(normalizedIngredient);

        if (isMatched) {
          matchedIngredients.push(ingredient.name);
          continue;
        }

        if (hasMatchedSubstitute(ingredient, normalizedUserIngredients)) {
          matchedIngredients.push(ingredient.name);
          partialMatchesCount += 1;
          continue;
        }

        if (ingredient.isEssential) {
          missingEssentialIngredients.push(ingredient.name);
        } else {
          missingOptionalIngredients.push(ingredient.name);
        }
      }

      const missingIngredientsCount =
        missingEssentialIngredients.length + missingOptionalIngredients.length;
      const exactMatchesCount = matchedIngredients.length - partialMatchesCount;
      const matchedScore = exactMatchesCount + partialMatchesCount * 0.5;
      const score =
        requiredIngredients.length === 0
          ? 0
          : matchedScore / requiredIngredients.length;
      const matchPercent = Math.round(score * 100);
      const status = getRecipeStatus(
        matchedIngredients.length,
        missingIngredientsCount,
        partialMatchesCount,
        matchPercent,
      );

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

function isBasicIngredient(ingredient: Recipe["ingredients"][number]): boolean {
  return (
    Boolean(ingredient.isBasic) ||
    basicIngredientNames.has(normalizeIngredient(ingredient.name))
  );
}

function hasMatchedSubstitute(
  ingredient: Recipe["ingredients"][number],
  normalizedUserIngredients: Set<string>,
): boolean {
  return (
    ingredient.substitutes?.some((substitute) =>
      normalizedUserIngredients.has(normalizeIngredient(substitute)),
    ) ?? false
  );
}

function getRecipeStatus(
  matchedIngredientsCount: number,
  missingIngredientsCount: number,
  partialMatchesCount: number,
  matchPercent: number,
): RecipeMatchResult["status"] {
  if (matchedIngredientsCount === 0) {
    return "not_enough";
  }

  if (missingIngredientsCount === 0 && partialMatchesCount === 0) {
    return "can_cook";
  }

  if (
    missingIngredientsCount + partialMatchesCount <= 2 &&
    matchPercent >= 50
  ) {
    return "almost";
  }

  return "not_enough";
}
