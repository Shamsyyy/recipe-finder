"use client";

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useMemo,
  useState,
} from "react";

import { recipes as fallbackRecipes } from "@/data/recipes";
import { normalizeIngredient } from "@/lib/normalizeIngredient";
import type { Recipe } from "@/lib/types";

interface IngredientInputProps {
  value: string[];
  onChange: (ingredients: string[]) => void;
  recipes?: Recipe[];
}

export function IngredientInput({
  value,
  onChange,
  recipes = fallbackRecipes,
}: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  const ingredientOptions = useMemo(
    () =>
      Array.from(
        new Set(
          recipes.flatMap((recipe) =>
            recipe.ingredients.map((ingredient) => ingredient.name),
          ),
        ),
      ).sort((first, second) => first.localeCompare(second, "ru")),
    [recipes],
  );

  const suggestions = useMemo(() => {
    const normalizedInput = normalizeIngredient(inputValue);

    if (!normalizedInput || !isSuggestionsOpen) {
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
  }, [ingredientOptions, inputValue, isSuggestionsOpen, value]);

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
    setActiveSuggestionIndex(-1);
    setIsSuggestionsOpen(false);
  }

  function removeIngredient(ingredient: string) {
    onChange(value.filter((item) => item !== ingredient));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;

    setInputValue(nextValue);
    setIsSuggestionsOpen(true);
    setActiveSuggestionIndex(nextValue.trim() ? 0 : -1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
      addIngredient(suggestions[activeSuggestionIndex]);
      return;
    }

    addIngredient();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      if (suggestions.length === 0) {
        setActiveSuggestionIndex(-1);
        return;
      }

      event.preventDefault();
      setActiveSuggestionIndex((currentIndex) =>
        currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      if (suggestions.length === 0) {
        setActiveSuggestionIndex(-1);
        return;
      }

      event.preventDefault();
      setActiveSuggestionIndex((currentIndex) =>
        currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        addIngredient(suggestions[activeSuggestionIndex]);
        return;
      }

      addIngredient();
      return;
    }

    if (event.key === "Escape") {
      setIsSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
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
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Например: курица, рис, сыр"
            className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="ingredient-suggestions"
            aria-activedescendant={
              activeSuggestionIndex >= 0
                ? `ingredient-suggestion-${activeSuggestionIndex}`
                : undefined
            }
          />

          {suggestions.length > 0 && (
            <ul
              id="ingredient-suggestions"
              className="absolute left-0 right-0 top-full z-10 mt-2 max-h-72 overflow-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
            >
              {suggestions.map((suggestion, index) => {
                const isActive = index === activeSuggestionIndex;

                return (
                  <li key={suggestion}>
                    <button
                      id={`ingredient-suggestion-${index}`}
                      type="button"
                      onClick={() => addIngredient(suggestion)}
                      className={`flex min-h-10 w-full items-center rounded-md px-3 text-left text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800"
                          : "text-zinc-800 hover:bg-emerald-50 hover:text-emerald-800"
                      }`}
                    >
                      {suggestion}
                    </button>
                  </li>
                );
              })}
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
