create extension if not exists "pgcrypto";

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  image_url text,
  cooking_time_minutes integer,
  difficulty text,
  servings integer,
  category text,
  created_at timestamp with time zone default now()
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text unique not null
);

create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id),
  amount text,
  is_essential boolean default true,
  is_basic boolean default false,
  substitutes text[]
);

create table if not exists public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade,
  step_number integer not null,
  text text not null,
  image_url text
);

create index if not exists recipes_slug_idx
  on public.recipes(slug);

create index if not exists ingredients_normalized_name_idx
  on public.ingredients(normalized_name);

create index if not exists recipe_ingredients_recipe_id_idx
  on public.recipe_ingredients(recipe_id);

create index if not exists recipe_ingredients_ingredient_id_idx
  on public.recipe_ingredients(ingredient_id);

create index if not exists recipe_steps_recipe_id_idx
  on public.recipe_steps(recipe_id);

alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;

drop policy if exists "Recipes are readable by everyone" on public.recipes;
create policy "Recipes are readable by everyone"
  on public.recipes for select
  using (true);

drop policy if exists "Ingredients are readable by everyone" on public.ingredients;
create policy "Ingredients are readable by everyone"
  on public.ingredients for select
  using (true);

drop policy if exists "Recipe ingredients are readable by everyone"
  on public.recipe_ingredients;
create policy "Recipe ingredients are readable by everyone"
  on public.recipe_ingredients for select
  using (true);

drop policy if exists "Recipe steps are readable by everyone"
  on public.recipe_steps;
create policy "Recipe steps are readable by everyone"
  on public.recipe_steps for select
  using (true);
