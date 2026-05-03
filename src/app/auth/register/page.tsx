"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/");
      return;
    }

    setMessage("Проверьте email и подтвердите регистрацию.");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950">
      <div className="mx-auto w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
        >
          ← На главную
        </Link>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Регистрация</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Создайте аккаунт через Supabase Auth.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="min-h-12 w-full rounded-lg border border-zinc-200 px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="password"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="min-h-12 w-full rounded-lg border border-zinc-200 px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-lg bg-emerald-600 px-5 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {isSubmitting ? "Регистрируем..." : "Зарегистрироваться"}
          </button>

          <p className="text-center text-sm text-zinc-600">
            Уже есть аккаунт?{" "}
            <Link className="font-semibold text-emerald-700" href="/auth/login">
              Войти
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
