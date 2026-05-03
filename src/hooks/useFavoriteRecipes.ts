"use client";

import { useCallback, useSyncExternalStore } from "react";

const FAVORITE_RECIPES_STORAGE_KEY = "favoriteRecipes";
const FAVORITE_RECIPES_CHANGED_EVENT = "favoriteRecipesChanged";
const EMPTY_FAVORITES = "[]";

export function useFavoriteRecipes() {
  const snapshot = useSyncExternalStore(
    subscribeToFavoriteRecipes,
    getFavoriteRecipesSnapshot,
    getServerFavoriteRecipesSnapshot,
  );
  const favoriteSlugs = parseFavoriteSlugs(snapshot);

  const addFavorite = useCallback(
    (slug: string) => {
      if (favoriteSlugs.includes(slug)) {
        return;
      }

      writeFavoriteSlugs([...favoriteSlugs, slug]);
    },
    [favoriteSlugs],
  );

  const removeFavorite = useCallback(
    (slug: string) => {
      writeFavoriteSlugs(favoriteSlugs.filter((item) => item !== slug));
    },
    [favoriteSlugs],
  );

  const isFavorite = useCallback(
    (slug: string) => favoriteSlugs.includes(slug),
    [favoriteSlugs],
  );

  const toggleFavorite = useCallback(
    (slug: string) => {
      if (favoriteSlugs.includes(slug)) {
        writeFavoriteSlugs(favoriteSlugs.filter((item) => item !== slug));
        return;
      }

      writeFavoriteSlugs([...favoriteSlugs, slug]);
    },
    [favoriteSlugs],
  );

  return {
    favoriteSlugs,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}

function subscribeToFavoriteRecipes(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(FAVORITE_RECIPES_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(FAVORITE_RECIPES_CHANGED_EVENT, onStoreChange);
  };
}

function getFavoriteRecipesSnapshot() {
  return window.localStorage.getItem(FAVORITE_RECIPES_STORAGE_KEY) ?? EMPTY_FAVORITES;
}

function getServerFavoriteRecipesSnapshot() {
  return EMPTY_FAVORITES;
}

function parseFavoriteSlugs(snapshot: string): string[] {
  try {
    const parsedValue = JSON.parse(snapshot);
    return Array.isArray(parsedValue) ? parsedValue.filter(isString) : [];
  } catch {
    return [];
  }
}

function writeFavoriteSlugs(slugs: string[]) {
  window.localStorage.setItem(
    FAVORITE_RECIPES_STORAGE_KEY,
    JSON.stringify(slugs),
  );
  window.dispatchEvent(new Event(FAVORITE_RECIPES_CHANGED_EVENT));
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
