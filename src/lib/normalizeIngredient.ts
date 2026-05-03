import { ingredientAliases } from "@/data/ingredientAliases";

export function normalizeIngredient(ingredient: string): string {
  const normalized = ingredient
    .toLowerCase()
    .replaceAll("ё", "е")
    .trim()
    .replace(/\s+/g, " ");

  return ingredientAliases[normalized] ?? normalized;
}
