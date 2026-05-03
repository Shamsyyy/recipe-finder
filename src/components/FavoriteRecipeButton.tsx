"use client";

import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";

interface FavoriteRecipeButtonProps {
  slug: string;
}

export function FavoriteRecipeButton({ slug }: FavoriteRecipeButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoriteRecipes();
  const isRecipeFavorite = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold shadow-sm transition ${
        isRecipeFavorite
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
      }`}
      aria-pressed={isRecipeFavorite}
    >
      <span aria-hidden="true">{isRecipeFavorite ? "♥" : "♡"}</span>
      {isRecipeFavorite ? "В избранном" : "В избранное"}
    </button>
  );
}
