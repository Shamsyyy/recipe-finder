"use client";

import { useState } from "react";

import {
  mergeShoppingListItems,
  parseShoppingListSnapshot,
  SHOPPING_LIST_STORAGE_KEY,
  writeShoppingList,
} from "@/lib/shoppingList";

interface AddToShoppingListButtonProps {
  ingredients: string[];
}

export function AddToShoppingListButton({
  ingredients,
}: AddToShoppingListButtonProps) {
  const [isAdded, setIsAdded] = useState(false);

  if (ingredients.length === 0) {
    return null;
  }

  function addToShoppingList() {
    const storedValue = window.localStorage.getItem(SHOPPING_LIST_STORAGE_KEY);
    const currentItems = parseShoppingListSnapshot(storedValue ?? "[]");
    const nextItems = mergeShoppingListItems(currentItems, ingredients);

    writeShoppingList(nextItems);
    setIsAdded(true);
  }

  return (
    <button
      type="button"
      onClick={addToShoppingList}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
    >
      {isAdded ? "Добавлено в список покупок" : "Добавить недостающее в список покупок"}
    </button>
  );
}
