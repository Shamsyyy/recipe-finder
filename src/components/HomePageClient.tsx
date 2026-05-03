"use client";

import { useMemo, useState } from "react";

import { AuthStatus } from "@/components/AuthStatus";
import { IngredientInput } from "@/components/IngredientInput";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeResults } from "@/components/RecipeResults";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import { useShoppingList } from "@/hooks/useShoppingList";
import { matchRecipes } from "@/lib/matchRecipes";
import { normalizeIngredient } from "@/lib/normalizeIngredient";
import type { Recipe, RecipeCategory, RecipeMatchResult } from "@/lib/types";

type QuickFilterId =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "under-15"
  | "under-30"
  | "easy";

interface HomePageClientProps {
  recipes: Recipe[];
}

interface QuickFilter {
  id: QuickFilterId;
  label: string;
}

const popularIngredients = [
  "курица",
  "рис",
  "яйцо",
  "сыр",
  "картофель",
  "помидор",
  "творог",
  "гречка",
  "лук",
  "морковь",
];

const quickFilters: QuickFilter[] = [
  { id: "breakfast", label: "Завтрак" },
  { id: "lunch", label: "Обед" },
  { id: "dinner", label: "Ужин" },
  { id: "under-15", label: "До 15 минут" },
  { id: "under-30", label: "До 30 минут" },
  { id: "easy", label: "Простые рецепты" },
];

const categoryFilterIds: Partial<Record<QuickFilterId, RecipeCategory>> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
};

export function HomePageClient({ recipes }: HomePageClientProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<QuickFilterId[]>([]);
  const { favoriteSlugs } = useFavoriteRecipes();
  const shoppingList = useShoppingList();

  const results = useMemo(
    () => matchRecipes(ingredients, recipes),
    [ingredients, recipes],
  );

  const filteredResults = useMemo(
    () => filterRecipeResults(results, activeFilters),
    [results, activeFilters],
  );
  const favoriteRecipes = useMemo(
    () =>
      favoriteSlugs
        .map((slug) => recipes.find((recipe) => recipe.slug === slug))
        .filter((recipe) => recipe !== undefined),
    [favoriteSlugs, recipes],
  );
  const favoriteResults = useMemo(
    () => matchRecipes(ingredients, favoriteRecipes),
    [favoriteRecipes, ingredients],
  );
  const favoriteResultsWithoutMatchInfo = useMemo(
    () =>
      favoriteRecipes.map((recipe) => ({
        recipe,
        score: 0,
        matchedIngredients: [],
        missingEssentialIngredients: [],
        missingOptionalIngredients: [],
        status: "not_enough" as const,
      })),
    [favoriteRecipes],
  );
  const shouldShowFavoriteMatchInfo = ingredients.length > 0;
  const visibleFavoriteResults = shouldShowFavoriteMatchInfo
    ? favoriteResults
    : favoriteResultsWithoutMatchInfo;

  function addPopularIngredient(ingredient: string) {
    const normalizedIngredient = normalizeIngredient(ingredient);
    const hasIngredient = ingredients.some(
      (item) => normalizeIngredient(item) === normalizedIngredient,
    );

    if (!hasIngredient) {
      setIngredients([...ingredients, ingredient]);
    }
  }

  function toggleFilter(filterId: QuickFilterId) {
    setActiveFilters((currentFilters) =>
      currentFilters.includes(filterId)
        ? currentFilters.filter((id) => id !== filterId)
        : [...currentFilters, filterId],
    );
  }

  function clearFilters() {
    setActiveFilters([]);
  }

  async function addToShoppingList(items: string[]) {
    await shoppingList.addItems(items);
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex justify-end">
            <AuthStatus />
          </div>

          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Подбор рецептов по продуктам
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-5xl">
              Что приготовить из того, что есть дома?
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              Введите продукты из холодильника, а мы покажем блюда, которые
              можно приготовить сейчас или почти без похода в магазин.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 shadow-sm sm:p-5">
            <IngredientInput
              value={ingredients}
              onChange={setIngredients}
              recipes={recipes}
            />

            <div className="mt-5 space-y-3">
              <p className="text-sm font-medium text-zinc-700">
                Популярные продукты
              </p>
              <div className="flex flex-wrap gap-2">
                {popularIngredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    type="button"
                    onClick={() => addPopularIngredient(ingredient)}
                    className="min-h-9 rounded-full border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    {ingredient}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {visibleFavoriteResults.length > 0 && (
          <section className="mb-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                Избранное
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Рецепты, которые вы сохранили в этом браузере.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleFavoriteResults.map((result) => (
                <RecipeCard
                  key={result.recipe.slug}
                  result={result}
                  hideMatchInfo={!shouldShowFavoriteMatchInfo}
                  onAddMissingToShoppingList={addToShoppingList}
                  isShoppingListAvailable={shoppingList.isAuthenticated}
                />
              ))}
            </div>
          </section>
        )}

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                Список покупок
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Недостающие продукты сохраняются в вашем аккаунте.
              </p>
            </div>
            {shoppingList.isAuthenticated && shoppingList.items.length > 0 && (
              <button
                type="button"
                onClick={shoppingList.clearItems}
                className="min-h-9 self-start rounded-lg px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 sm:self-auto"
              >
                Очистить
              </button>
            )}
          </div>

          {!shoppingList.isAuthenticated ? (
            <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              Войдите, чтобы сохранять список покупок в аккаунте.
            </p>
          ) : shoppingList.items.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {shoppingList.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg bg-amber-50 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={(event) =>
                      shoppingList.toggleItemChecked(
                        item.id,
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4 rounded border-amber-300 text-emerald-600"
                  />
                  <span
                    className={`flex-1 text-sm font-medium ${
                      item.isChecked
                        ? "text-zinc-500 line-through"
                        : "text-amber-900"
                    }`}
                  >
                    {item.ingredientName}
                  </span>
                  <button
                    type="button"
                    onClick={() => shoppingList.removeItem(item.id)}
                    className="min-h-8 rounded-md px-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
                    aria-label={`Удалить ${item.ingredientName} из списка покупок`}
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              Пока пусто. Добавьте недостающие продукты из карточки рецепта.
            </p>
          )}
        </div>

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                Быстрые фильтры
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Уточните подбор без перезагрузки страницы.
              </p>
            </div>
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-9 self-start rounded-lg px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 sm:self-auto"
              >
                Сбросить
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickFilters.map((filter) => {
              const isActive = activeFilters.includes(filter.id);

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => toggleFilter(filter.id)}
                  className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${
                    isActive
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                  aria-pressed={isActive}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {ingredients.length > 0 ? (
          <RecipeResults
            results={filteredResults}
            onAddMissingToShoppingList={addToShoppingList}
            isShoppingListAvailable={shoppingList.isAuthenticated}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center sm:p-8">
            <h2 className="text-xl font-semibold text-zinc-950">
              Добавьте продукты, чтобы увидеть рецепты
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Начните с 2-4 ингредиентов или используйте быстрые кнопки выше.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function filterRecipeResults(
  results: RecipeMatchResult[],
  activeFilters: QuickFilterId[],
): RecipeMatchResult[] {
  if (activeFilters.length === 0) {
    return results;
  }

  return results.filter(({ recipe }) => {
    const categoryFilters = activeFilters
      .map((filterId) => categoryFilterIds[filterId])
      .filter(Boolean);

    if (
      categoryFilters.length > 0 &&
      !categoryFilters.includes(recipe.category)
    ) {
      return false;
    }

    if (
      activeFilters.includes("under-15") &&
      recipe.cookingTimeMinutes > 15
    ) {
      return false;
    }

    if (
      activeFilters.includes("under-30") &&
      recipe.cookingTimeMinutes > 30
    ) {
      return false;
    }

    if (activeFilters.includes("easy") && recipe.difficulty !== "easy") {
      return false;
    }

    return true;
  });
}
