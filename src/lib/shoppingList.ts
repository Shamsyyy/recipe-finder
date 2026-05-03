import { normalizeIngredient } from "@/lib/normalizeIngredient";

export const SHOPPING_LIST_STORAGE_KEY = "recipe-finder-shopping-list";
export const SHOPPING_LIST_CHANGED_EVENT =
  "recipe-finder-shopping-list-changed";

export function mergeShoppingListItems(
  currentItems: string[],
  nextItems: string[],
): string[] {
  const result = [...currentItems];
  const normalizedItems = new Set(
    currentItems.map((item) => normalizeIngredient(item)),
  );

  for (const item of nextItems) {
    const normalizedItem = normalizeIngredient(item);

    if (!normalizedItem || normalizedItems.has(normalizedItem)) {
      continue;
    }

    result.push(item);
    normalizedItems.add(normalizedItem);
  }

  return result;
}

export function parseShoppingListSnapshot(snapshot: string): string[] {
  try {
    const parsedValue = JSON.parse(snapshot);
    return Array.isArray(parsedValue) ? parsedValue.filter(isString) : [];
  } catch {
    return [];
  }
}

export function writeShoppingList(items: string[]) {
  window.localStorage.setItem(SHOPPING_LIST_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(SHOPPING_LIST_CHANGED_EVENT));
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
