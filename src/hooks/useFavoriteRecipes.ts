"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

const FAVORITE_RECIPES_STORAGE_KEY = "favoriteRecipes";
const FAVORITE_RECIPES_CHANGED_EVENT = "favoriteRecipesChanged";

interface FavoriteRow {
  recipe_slug: string;
}

export function useFavoriteRecipes() {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const loadFavorites = useCallback(async (nextUserId: string | null) => {
    if (!nextUserId) {
      setFavoriteSlugs(readLocalFavoriteSlugs());
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("recipe_slug")
      .eq("user_id", nextUserId);

    if (error) {
      console.error("Не удалось загрузить избранные рецепты из Supabase", error);
      setFavoriteSlugs([]);
      return;
    }

    setFavoriteSlugs(
      (data as FavoriteRow[]).map((row) => row.recipe_slug).filter(isString),
    );
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Не удалось получить пользователя Supabase", error);
      }

      const nextUserId = data.user?.id ?? null;
      setUserId(nextUserId);
      void loadFavorites(nextUserId);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user.id ?? null;
      setUserId(nextUserId);
      void loadFavorites(nextUserId);
    });

    return () => subscription.unsubscribe();
  }, [loadFavorites]);

  useEffect(() => {
    function handleFavoritesChanged() {
      void loadFavorites(userId);
    }

    window.addEventListener("storage", handleFavoritesChanged);
    window.addEventListener(FAVORITE_RECIPES_CHANGED_EVENT, handleFavoritesChanged);

    return () => {
      window.removeEventListener("storage", handleFavoritesChanged);
      window.removeEventListener(
        FAVORITE_RECIPES_CHANGED_EVENT,
        handleFavoritesChanged,
      );
    };
  }, [loadFavorites, userId]);

  const addFavorite = useCallback(
    async (slug: string) => {
      if (favoriteSlugs.includes(slug)) {
        return;
      }

      const nextFavoriteSlugs = [...favoriteSlugs, slug];

      if (!userId) {
        setFavoriteSlugs(nextFavoriteSlugs);
        writeLocalFavoriteSlugs(nextFavoriteSlugs);
        return;
      }

      const { error } = await supabase.from("favorites").upsert(
        {
          user_id: userId,
          recipe_slug: slug,
        },
        {
          onConflict: "user_id,recipe_slug",
          ignoreDuplicates: true,
        },
      );

      if (error) {
        console.error("Не удалось добавить рецепт в избранное Supabase", error);
        return;
      }

      setFavoriteSlugs(nextFavoriteSlugs);
      dispatchFavoritesChanged();
    },
    [favoriteSlugs, userId],
  );

  const removeFavorite = useCallback(
    async (slug: string) => {
      const nextFavoriteSlugs = favoriteSlugs.filter((item) => item !== slug);

      if (!userId) {
        setFavoriteSlugs(nextFavoriteSlugs);
        writeLocalFavoriteSlugs(nextFavoriteSlugs);
        return;
      }

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_slug", slug);

      if (error) {
        console.error("Не удалось удалить рецепт из избранного Supabase", error);
        return;
      }

      setFavoriteSlugs(nextFavoriteSlugs);
      dispatchFavoritesChanged();
    },
    [favoriteSlugs, userId],
  );

  const isFavorite = useCallback(
    (slug: string) => favoriteSlugs.includes(slug),
    [favoriteSlugs],
  );

  const toggleFavorite = useCallback(
    async (slug: string) => {
      if (favoriteSlugs.includes(slug)) {
        await removeFavorite(slug);
        return;
      }

      await addFavorite(slug);
    },
    [addFavorite, favoriteSlugs, removeFavorite],
  );

  return {
    favoriteSlugs,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}

function readLocalFavoriteSlugs(): string[] {
  try {
    const storedValue = window.localStorage.getItem(FAVORITE_RECIPES_STORAGE_KEY);
    const parsedValue = JSON.parse(storedValue ?? "[]");

    return Array.isArray(parsedValue) ? parsedValue.filter(isString) : [];
  } catch {
    return [];
  }
}

function writeLocalFavoriteSlugs(slugs: string[]) {
  window.localStorage.setItem(
    FAVORITE_RECIPES_STORAGE_KEY,
    JSON.stringify(slugs),
  );
  dispatchFavoritesChanged();
}

function dispatchFavoritesChanged() {
  window.dispatchEvent(new Event(FAVORITE_RECIPES_CHANGED_EVENT));
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
