import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToShoppingListButton } from "@/components/AddToShoppingListButton";
import { FavoriteRecipeButton } from "@/components/FavoriteRecipeButton";
import { recipes } from "@/data/recipes";
import type { Difficulty } from "@/lib/types";

interface RecipePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    missing?: string | string[];
  }>;
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Легко",
  medium: "Средне",
  hard: "Сложно",
};

export default async function RecipePage({
  params,
  searchParams,
}: RecipePageProps) {
  const { slug } = await params;
  const { missing } = await searchParams;
  const recipe = recipes.find((item) => item.slug === slug);

  if (!recipe) {
    notFound();
  }

  const missingIngredients = parseMissingIngredients(missing);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <article className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Link
          href="/"
          className="mb-4 inline-flex min-h-11 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
        >
          ← На главную
        </Link>

        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="relative aspect-[16/10] w-full bg-zinc-100 sm:aspect-[16/7]">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
            />
          </div>

          <div className="space-y-8 p-5 sm:p-8">
            <header className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {recipe.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-5xl">
                  {recipe.title}
                </h1>
                <p className="max-w-3xl text-base leading-7 text-zinc-600 sm:text-lg">
                  {recipe.description}
                </p>
              </div>

              <FavoriteRecipeButton slug={recipe.slug} />

              <dl className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-zinc-50 p-4">
                  <dt className="text-sm font-medium text-zinc-500">Время</dt>
                  <dd className="mt-1 text-lg font-semibold text-zinc-950">
                    {recipe.cookingTimeMinutes} мин
                  </dd>
                </div>
                <div className="rounded-lg bg-zinc-50 p-4">
                  <dt className="text-sm font-medium text-zinc-500">
                    Сложность
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-zinc-950">
                    {difficultyLabels[recipe.difficulty]}
                  </dd>
                </div>
                <div className="rounded-lg bg-zinc-50 p-4">
                  <dt className="text-sm font-medium text-zinc-500">Порции</dt>
                  <dd className="mt-1 text-lg font-semibold text-zinc-950">
                    {recipe.servings}
                  </dd>
                </div>
              </dl>

              {missingIngredients.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <h2 className="text-base font-semibold text-amber-950">
                        Не хватает для рецепта
                      </h2>
                      <ul className="flex flex-wrap gap-2">
                        {missingIngredients.map((ingredient) => (
                          <li
                            key={ingredient}
                            className="rounded-full bg-white px-3 py-1 text-sm font-medium text-amber-900"
                          >
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <AddToShoppingListButton ingredients={missingIngredients} />
                  </div>
                </div>
              )}
            </header>

            <section className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                  Ингредиенты
                </h2>
                <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
                  {recipe.ingredients.map((ingredient) => (
                    <li
                      key={`${ingredient.name}-${ingredient.amount}`}
                      className="flex items-start justify-between gap-4 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-zinc-950">
                          {ingredient.name}
                        </p>
                        {ingredient.substitutes &&
                          ingredient.substitutes.length > 0 && (
                            <p className="mt-1 text-sm text-zinc-500">
                              Можно заменить на:{" "}
                              {ingredient.substitutes.join(", ")}
                            </p>
                          )}
                      </div>
                      <span className="shrink-0 text-right text-sm font-medium text-zinc-600">
                        {ingredient.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                  Пошаговая инструкция
                </h2>
                <ol className="space-y-3">
                  {recipe.steps.map((step, index) => (
                    <li
                      key={step}
                      className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-base leading-7 text-zinc-700">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}

function parseMissingIngredients(missing?: string | string[]): string[] {
  const missingValue = Array.isArray(missing) ? missing.join(",") : missing;

  if (!missingValue) {
    return [];
  }

  return missingValue
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
}
