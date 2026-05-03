"use client";

import { FormEvent, KeyboardEvent, useMemo, useState } from "react";

import { recipes } from "@/data/recipes";
import { normalizeIngredient } from "@/lib/normalizeIngredient";

interface IngredientInputProps {
  value: string[];
  onChange: (ingredients: string[]) => void;
}

const ingredientOptions = Array.from(
  new Set(recipes.flatMap((recipe) => recipe.ingredients.map((item) => item.name))),
).sort((first, second) => first.localeCompare(second, "ru"));

export function IngredientInput({ value, onChange }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");

  const suggestions = useMemo(() => {
    const normalizedInput = normalizeIngredient(inputValue);

    if (!normalizedInput) {
      return [];
    }

    return ingredientOptions
      .filter((ingredient) => {
        const normalizedIngredient = normalizeIngredient(ingredient);
        const isAlreadySelected = value.some(
          (item) => normalizeIngredient(item) === normalizedIngredient,
        );

        return (
          !isAlreadySelected && normalizedIngredient.includes(normalizedInput)
        );
      })
      .slice(0, 8);
  }, [inputValue, value]);

  function addIngredient(nextIngredient = inputValue) {
    const ingredient = nextIngredient.trim().replace(/\s+/g, " ");

    if (!ingredient) {
      return;
    }

    const normalizedIngredient = normalizeIngredient(ingredient);
    const hasIngredient = value.some(
      (item) => normalizeIngredient(item) === normalizedIngredient,
    );

    if (!hasIngredient) {
      onChange([...value, ingredient]);
    }

    setInputValue("");
  }

  function removeIngredient(ingredient: string) {
    onChange(value.filter((item) => item !== ingredient));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addIngredient();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addIngredient();
    }
  }

  return (
    <div className="w-full space-y-4">
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <label className="sr-only" htmlFor="ingredient-input">
            Продукт
          </label>
          <input
            id="ingredient-input"
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Например: курица, рис, сыр"
            className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            autoComplete="off"
          />

          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-10 mt-2 max-h-72 overflow-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => addIngredient(suggestion)}
                    className="flex min-h-10 w-full items-center rounded-md px-3 text-left text-sm font-medium text-zinc-800 transition hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="min-h-12 rounded-lg bg-emerald-600 px-5 text-base font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Добавить
        </button>
      </form>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Выбранные продукты">
          {value.map((ingredient) => (
            <li key={ingredient}>
              <button
                type="button"
                onClick={() => removeIngredient(ingredient)}
                className="inline-flex min-h-9 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100"
                aria-label={`Удалить ${ingredient}`}
              >
                <span>{ingredient}</span>
                <span aria-hidden="true" className="text-base leading-none">
                  x
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
