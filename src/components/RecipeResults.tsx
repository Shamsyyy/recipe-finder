import { RecipeCard } from "@/components/RecipeCard";
import type { RecipeMatchResult } from "@/lib/types";

interface RecipeResultsProps {
  results: RecipeMatchResult[];
  onAddMissingToShoppingList?: (ingredients: string[]) => void;
}

export function RecipeResults({
  results,
  onAddMissingToShoppingList,
}: RecipeResultsProps) {
  const canCookResults = results.filter((result) => result.status === "can_cook");
  const almostResults = results.filter((result) => result.status === "almost");
  const visibleResultsCount = canCookResults.length + almostResults.length;

  if (visibleResultsCount === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-zinc-950">
          Подходящих рецептов пока нет
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Добавьте больше продуктов или попробуйте другие ингредиенты.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <RecipeResultsGroup
        title="Можно приготовить"
        description="Рецепты, где хватает всех основных ингредиентов."
        results={canCookResults}
        onAddMissingToShoppingList={onAddMissingToShoppingList}
      />
      <RecipeResultsGroup
        title="Почти подходит"
        description="Рецепты, где не хватает одного или двух важных продуктов."
        results={almostResults}
        onAddMissingToShoppingList={onAddMissingToShoppingList}
      />
    </div>
  );
}

interface RecipeResultsGroupProps {
  title: string;
  description: string;
  results: RecipeMatchResult[];
  onAddMissingToShoppingList?: (ingredients: string[]) => void;
}

function RecipeResultsGroup({
  title,
  description,
  results,
  onAddMissingToShoppingList,
}: RecipeResultsGroupProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <RecipeCard
            key={result.recipe.id}
            result={result}
            onAddMissingToShoppingList={onAddMissingToShoppingList}
          />
        ))}
      </div>
    </section>
  );
}
