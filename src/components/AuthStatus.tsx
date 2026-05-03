"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

export function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setEmail(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-10 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-500">
        Проверяем вход...
      </div>
    );
  }

  if (email) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <span className="text-sm font-medium text-zinc-700">{email}</span>
        <button
          type="button"
          onClick={signOut}
          className="min-h-9 rounded-lg bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Выйти
        </button>
      </div>
    );
  }

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Авторизация">
      <Link
        href="/auth/login"
        className="inline-flex min-h-10 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
      >
        Войти
      </Link>
      <Link
        href="/auth/register"
        className="inline-flex min-h-10 items-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        Регистрация
      </Link>
    </nav>
  );
}
