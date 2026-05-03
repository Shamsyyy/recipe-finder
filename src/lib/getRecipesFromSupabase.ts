import { createClient } from "@supabase/supabase-js";

import { recipes as fallbackRecipes } from "@/data/recipes";
import type {
  Difficulty,
  Recipe,
  RecipeCategory,
  RecipeIngredient,
} from "@/lib/types";

interface SupabaseRecipeRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cooking_time_minutes: number | null;
  difficulty: Difficulty | null;
  servings: number | null;
  category: RecipeCategory | null;
  recipe_ingredients?: SupabaseRecipeIngredientRow[];
  recipe_steps?: SupabaseRecipeStepRow[];
}

interface SupabaseRecipeIngredientRow {
  amount: string | null;
  is_essential: boolean | null;
  is_basic: boolean | null;
  substitutes: string[] | null;
  ingredients?: {
    name: string;
  } | { name: string }[] | null;
}

interface SupabaseRecipeStepRow {
  step_number: number;
  text: string;
}

export async function getRecipesFromSupabase(): Promise<Recipe[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return fallbackRecipes;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
        id,
        slug,
        title,
        description,
        image_url,
        cooking_time_minutes,
        difficulty,
        servings,
        category,
        recipe_ingredients (
          amount,
          is_essential,
          is_basic,
          substitutes,
          ingredients (
            name
          )
        ),
        recipe_steps (
          step_number,
          text
        )
      `,
    );

  if (error || !data || data.length === 0) {
    console.error("Не удалось загрузить рецепты из Supabase", error);
    return fallbackRecipes;
  }

  return (data as unknown as SupabaseRecipeRow[]).map(mapRecipeFromSupabase);
}

function mapRecipeFromSupabase(row: SupabaseRecipeRow): Recipe {
  const steps = [...(row.recipe_steps ?? [])]
    .sort((first, second) => first.step_number - second.step_number)
    .map((step) => step.text);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "/images/recipes/placeholder.jpg",
    cookingTimeMinutes: row.cooking_time_minutes ?? 0,
    difficulty: row.difficulty ?? "easy",
    servings: row.servings ?? 1,
    category: row.category ?? "dinner",
    ingredients: (row.recipe_ingredients ?? [])
      .filter((ingredient) => getIngredientName(ingredient))
      .map(mapIngredientFromSupabase),
    steps,
    tags: [],
  };
}

function mapIngredientFromSupabase(
  row: SupabaseRecipeIngredientRow,
): RecipeIngredient {
  return {
    name: getIngredientName(row) ?? "",
    amount: row.amount ?? "",
    isEssential: row.is_essential ?? true,
    isBasic: row.is_basic ?? false,
    substitutes: row.substitutes ?? undefined,
  };
}

function getIngredientName(
  row: SupabaseRecipeIngredientRow,
): string | undefined {
  if (Array.isArray(row.ingredients)) {
    return row.ingredients[0]?.name;
  }

  return row.ingredients?.name;
}
