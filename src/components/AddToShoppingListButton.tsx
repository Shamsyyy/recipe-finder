"use client";

import { useState } from "react";

import { useShoppingList } from "@/hooks/useShoppingList";

interface AddToShoppingListButtonProps {
  ingredients: string[];
}

export function AddToShoppingListButton({
  ingredients,
}: AddToShoppingListButtonProps) {
  const shoppingList = useShoppingList();
  const [isAdded, setIsAdded] = useState(false);

  if (ingredients.length === 0) {
    return null;
  }

  async function addToShoppingList() {
    const wasAdded = await shoppingList.addItems(ingredients);

    if (wasAdded) {
      setIsAdded(true);
    }
  }

  return (
    <button
      type="button"
      onClick={addToShoppingList}
      disabled={!shoppingList.isAuthenticated || shoppingList.isLoading}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 sm:w-auto"
    >
      {!shoppingList.isAuthenticated
        ? "Войдите, чтобы сохранить список покупок"
        : isAdded
          ? "Добавлено в список покупок"
          : "Добавить недостающее в список покупок"}
    </button>
  );
}
