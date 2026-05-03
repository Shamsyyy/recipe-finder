"use client";

import { FormEvent, KeyboardEvent, useState } from "react";

interface IngredientInputProps {
  value: string[];
  onChange: (ingredients: string[]) => void;
}

export function IngredientInput({ value, onChange }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");

  function addIngredient() {
    const ingredient = inputValue.trim().replace(/\s+/g, " ");

    if (!ingredient) {
      return;
    }

    const hasIngredient = value.some(
      (item) => item.toLowerCase() === ingredient.toLowerCase(),
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
          className="min-h-12 flex-1 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
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
