export type Difficulty = "easy" | "medium" | "hard";

export type RecipeCategory =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "dessert"
  | "soup"
  | "salad";

export interface RecipeIngredient {
  name: string;
  amount: string;
  isEssential: boolean;
  isBasic?: boolean;
  substitutes?: string[];
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  cookingTimeMinutes: number;
  difficulty: Difficulty;
  servings: number;
  category: RecipeCategory;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
}

export interface RecipeMatchResult {
  recipe: Recipe;
  score: number;
  matchedIngredients: string[];
  missingEssentialIngredients: string[];
  missingOptionalIngredients: string[];
  status: "can_cook" | "almost" | "not_enough";
}
