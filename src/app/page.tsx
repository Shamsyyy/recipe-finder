import { HomePageClient } from "@/components/HomePageClient";
import { getRecipesFromSupabase } from "@/lib/getRecipesFromSupabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recipes = await getRecipesFromSupabase();

  return <HomePageClient recipes={recipes} />;
}
