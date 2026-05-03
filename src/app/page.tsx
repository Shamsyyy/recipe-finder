"use client";

import { useMemo, useState } from "react";

import { IngredientInput } from "@/components/IngredientInput";
import { RecipeResults } from "@/components/RecipeResults";
import { recipes } from "@/data/recipes";
import { normalizeIngredient } from "@/lib/normalizeIngredient";
import { matchRecipes } from "@/lib/matchRecipes";

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

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]);

  const results = useMemo(
    () => matchRecipes(ingredients, recipes),
    [ingredients],
  );

  function addPopularIngredient(ingredient: string) {
    const normalizedIngredient = normalizeIngredient(ingredient);
    const hasIngredient = ingredients.some(
      (item) => normalizeIngredient(item) === normalizedIngredient,
    );

    if (!hasIngredient) {
      setIngredients([...ingredients, ingredient]);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
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
            <IngredientInput value={ingredients} onChange={setIngredients} />

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
        {ingredients.length > 0 ? (
          <RecipeResults results={results} />
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
