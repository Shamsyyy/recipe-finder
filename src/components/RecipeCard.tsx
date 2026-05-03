import Image from "next/image";
import Link from "next/link";

import type { Difficulty, RecipeMatchResult } from "@/lib/types";

interface RecipeCardProps {
  result: RecipeMatchResult;
  onAddMissingToShoppingList?: (ingredients: string[]) => void;
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Легко",
  medium: "Средне",
  hard: "Сложно",
};

const statusLabels: Record<RecipeMatchResult["status"], string> = {
  can_cook: "Можно приготовить",
  almost: "Почти подходит",
  not_enough: "Не хватает продуктов",
};

const statusClasses: Record<RecipeMatchResult["status"], string> = {
  can_cook: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  almost: "bg-amber-50 text-amber-700 ring-amber-100",
  not_enough: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

export function RecipeCard({
  result,
  onAddMissingToShoppingList,
}: RecipeCardProps) {
  const { recipe } = result;
  const matchPercent = Math.round(result.score * 100);
  const missingIngredients = [
    ...result.missingEssentialIngredients,
    ...result.missingOptionalIngredients,
  ];
  const recipeHref =
    missingIngredients.length > 0
      ? `/recipes/${recipe.slug}?missing=${encodeURIComponent(
          missingIngredients.join(","),
        )}`
      : `/recipes/${recipe.slug}`;

  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-zinc-100">
        <Image
          src={recipe.imageUrl}
          alt={recipe.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses[result.status]}`}
          >
            {statusLabels[result.status]}
          </span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
            {matchPercent}% совпадения
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold leading-tight text-zinc-950">
            {recipe.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-6 text-zinc-600">
            {recipe.description}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-zinc-50 p-3">
            <dt className="text-xs font-medium uppercase text-zinc-500">
              Время
            </dt>
            <dd className="mt-1 font-semibold text-zinc-950">
              {recipe.cookingTimeMinutes} мин
            </dd>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3">
            <dt className="text-xs font-medium uppercase text-zinc-500">
              Сложность
            </dt>
            <dd className="mt-1 font-semibold text-zinc-950">
              {difficultyLabels[recipe.difficulty]}
            </dd>
          </div>
        </dl>

        <div className="min-h-12">
          {missingIngredients.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-950">Не хватает:</p>
              <ul className="flex flex-wrap gap-2">
                {missingIngredients.map((ingredient) => (
                  <li
                    key={ingredient}
                    className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
                  >
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              Все основные продукты есть
            </p>
          )}
        </div>

        {missingIngredients.length > 0 && onAddMissingToShoppingList && (
          <button
            type="button"
            onClick={() => onAddMissingToShoppingList(missingIngredients)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            Добавить недостающее в список покупок
          </button>
        )}

        <Link
          href={recipeHref}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Открыть рецепт
        </Link>
      </div>
    </article>
  );
}
