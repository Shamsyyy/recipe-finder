"use client";

import { useCallback, useEffect, useState } from "react";

import { normalizeIngredient } from "@/lib/normalizeIngredient";
import { supabase } from "@/lib/supabase/client";

const SHOPPING_LIST_CHANGED_EVENT = "shoppingListChanged";

export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  normalizedName: string;
  isChecked: boolean;
}

interface ShoppingListRow {
  id: string;
  ingredient_name: string;
  normalized_name: string;
  is_checked: boolean;
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadShoppingList = useCallback(async (nextUserId: string | null) => {
    if (!nextUserId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("shopping_list")
      .select("id, ingredient_name, normalized_name, is_checked")
      .eq("user_id", nextUserId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Не удалось загрузить список покупок из Supabase", error);
      setItems([]);
      setIsLoading(false);
      return;
    }

    setItems((data as ShoppingListRow[]).map(mapShoppingListRow));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Не удалось получить пользователя Supabase", error);
      }

      const nextUserId = data.user?.id ?? null;
      setUserId(nextUserId);
      void loadShoppingList(nextUserId);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user.id ?? null;
      setUserId(nextUserId);
      setIsLoading(true);
      void loadShoppingList(nextUserId);
    });

    return () => subscription.unsubscribe();
  }, [loadShoppingList]);

  useEffect(() => {
    function handleShoppingListChanged() {
      void loadShoppingList(userId);
    }

    window.addEventListener(SHOPPING_LIST_CHANGED_EVENT, handleShoppingListChanged);

    return () => {
      window.removeEventListener(
        SHOPPING_LIST_CHANGED_EVENT,
        handleShoppingListChanged,
      );
    };
  }, [loadShoppingList, userId]);

  const addItems = useCallback(
    async (ingredientNames: string[]) => {
      if (!userId) {
        return false;
      }

      const existingNormalizedNames = new Set(
        items.map((item) => item.normalizedName),
      );
      const nextNormalizedNames = new Set<string>();
      const rows = ingredientNames
        .map((ingredientName) => ({
          ingredient_name: ingredientName,
          normalized_name: normalizeIngredient(ingredientName),
        }))
        .filter((item) => item.normalized_name)
        .filter((item) => {
          if (
            existingNormalizedNames.has(item.normalized_name) ||
            nextNormalizedNames.has(item.normalized_name)
          ) {
            return false;
          }

          nextNormalizedNames.add(item.normalized_name);
          return true;
        })
        .map((item) => ({
          user_id: userId,
          ingredient_name: item.ingredient_name,
          normalized_name: item.normalized_name,
          is_checked: false,
        }));

      if (rows.length === 0) {
        return true;
      }

      const { data, error } = await supabase
        .from("shopping_list")
        .upsert(rows, {
          onConflict: "user_id,normalized_name",
          ignoreDuplicates: true,
        })
        .select("id, ingredient_name, normalized_name, is_checked");

      if (error) {
        console.error("Не удалось добавить продукты в список покупок", error);
        return false;
      }

      setItems((currentItems) => mergeShoppingListItems(currentItems, data ?? []));
      dispatchShoppingListChanged();
      return true;
    },
    [items, userId],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!userId) {
        return;
      }

      const { error } = await supabase
        .from("shopping_list")
        .delete()
        .eq("id", itemId)
        .eq("user_id", userId);

      if (error) {
        console.error("Не удалось удалить продукт из списка покупок", error);
        return;
      }

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId),
      );
      dispatchShoppingListChanged();
    },
    [userId],
  );

  const toggleItemChecked = useCallback(
    async (itemId: string, isChecked: boolean) => {
      if (!userId) {
        return;
      }

      const { error } = await supabase
        .from("shopping_list")
        .update({ is_checked: isChecked })
        .eq("id", itemId)
        .eq("user_id", userId);

      if (error) {
        console.error("Не удалось обновить продукт в списке покупок", error);
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId ? { ...item, isChecked } : item,
        ),
      );
      dispatchShoppingListChanged();
    },
    [userId],
  );

  const clearItems = useCallback(async () => {
    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from("shopping_list")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Не удалось очистить список покупок", error);
      return;
    }

    setItems([]);
    dispatchShoppingListChanged();
  }, [userId]);

  return {
    items,
    isAuthenticated: Boolean(userId),
    isLoading,
    addItems,
    removeItem,
    toggleItemChecked,
    clearItems,
  };
}

function mapShoppingListRow(row: ShoppingListRow): ShoppingListItem {
  return {
    id: row.id,
    ingredientName: row.ingredient_name,
    normalizedName: row.normalized_name,
    isChecked: row.is_checked,
  };
}

function mergeShoppingListItems(
  currentItems: ShoppingListItem[],
  rows: ShoppingListRow[],
): ShoppingListItem[] {
  const nextItems = [...currentItems];
  const normalizedNames = new Set(
    currentItems.map((item) => item.normalizedName),
  );

  for (const row of rows) {
    const item = mapShoppingListRow(row);

    if (normalizedNames.has(item.normalizedName)) {
      continue;
    }

    nextItems.push(item);
    normalizedNames.add(item.normalizedName);
  }

  return nextItems;
}

function dispatchShoppingListChanged() {
  window.dispatchEvent(new Event(SHOPPING_LIST_CHANGED_EVENT));
}
