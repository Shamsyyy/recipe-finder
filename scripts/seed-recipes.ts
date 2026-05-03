import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

import { ingredientAliases } from "../src/data/ingredientAliases";
import { recipes } from "../src/data/recipes";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface RecipeRow {
  id: string;
  slug: string;
}

interface IngredientRow {
  id: string;
  normalized_name: string;
}

async function seedRecipes() {
  const recipeRows = recipes.map((recipe) => ({
    slug: recipe.slug,
    title: recipe.title,
    description: recipe.description,
    image_url: recipe.imageUrl,
    cooking_time_minutes: recipe.cookingTimeMinutes,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    category: recipe.category,
  }));

  const { data: upsertedRecipes, error: recipesError } = await supabase
    .from("recipes")
    .upsert(recipeRows, { onConflict: "slug" })
    .select("id, slug");

  if (recipesError) {
    throw recipesError;
  }

  const recipeIdsBySlug = new Map(
    (upsertedRecipes as RecipeRow[]).map((recipe) => [recipe.slug, recipe.id]),
  );

  const uniqueIngredients = new Map<string, string>();

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      uniqueIngredients.set(
        normalizeIngredientForSeed(ingredient.name),
        ingredient.name,
      );
    }
  }

  const ingredientRows = Array.from(uniqueIngredients.entries()).map(
    ([normalizedName, name]) => ({
      name,
      normalized_name: normalizedName,
    }),
  );

  const { data: upsertedIngredients, error: ingredientsError } = await supabase
    .from("ingredients")
    .upsert(ingredientRows, { onConflict: "normalized_name" })
    .select("id, normalized_name");

  if (ingredientsError) {
    throw ingredientsError;
  }

  const ingredientIdsByNormalizedName = new Map(
    (upsertedIngredients as IngredientRow[]).map((ingredient) => [
      ingredient.normalized_name,
      ingredient.id,
    ]),
  );

  const recipeIds = Array.from(recipeIdsBySlug.values());

  await deleteRowsOrThrow("recipe_ingredients", "recipe_id", recipeIds);
  await deleteRowsOrThrow("recipe_steps", "recipe_id", recipeIds);

  const recipeIngredientRows = recipes.flatMap((recipe) => {
    const recipeId = recipeIdsBySlug.get(recipe.slug);

    if (!recipeId) {
      throw new Error(`Recipe was not inserted: ${recipe.slug}`);
    }

    return recipe.ingredients.map((ingredient) => {
      const ingredientId = ingredientIdsByNormalizedName.get(
        normalizeIngredientForSeed(ingredient.name),
      );

      if (!ingredientId) {
        throw new Error(`Ingredient was not inserted: ${ingredient.name}`);
      }

      return {
        recipe_id: recipeId,
        ingredient_id: ingredientId,
        amount: ingredient.amount,
        is_essential: ingredient.isEssential,
        is_basic: ingredient.isBasic ?? false,
        substitutes: ingredient.substitutes ?? [],
      };
    });
  });

  await insertRowsOrThrow("recipe_ingredients", recipeIngredientRows);

  const recipeStepRows = recipes.flatMap((recipe) => {
    const recipeId = recipeIdsBySlug.get(recipe.slug);

    if (!recipeId) {
      throw new Error(`Recipe was not inserted: ${recipe.slug}`);
    }

    return recipe.steps.map((step, index) => ({
      recipe_id: recipeId,
      step_number: index + 1,
      text: step,
      image_url: null,
    }));
  });

  await insertRowsOrThrow("recipe_steps", recipeStepRows);

  console.log(`Seeded ${recipes.length} recipes.`);
}

async function deleteRowsOrThrow(
  table: string,
  column: string,
  values: string[],
) {
  if (values.length === 0) {
    return;
  }

  const { error } = await supabase.from(table).delete().in(column, values);

  if (error) {
    throw error;
  }
}

async function insertRowsOrThrow(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from(table).insert(rows);

  if (error) {
    throw error;
  }
}

function normalizeIngredientForSeed(ingredient: string): string {
  const normalized = ingredient
    .toLowerCase()
    .replaceAll("ё", "е")
    .trim()
    .replace(/\s+/g, " ");

  return ingredientAliases[normalized] ?? normalized;
}

seedRecipes().catch((error) => {
  console.error(error);
  process.exit(1);
});
