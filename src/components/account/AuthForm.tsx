"use client";

import { FormEvent, useState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/features/account/accountSlice";
import { selectAccountError, selectAccountNotice, selectAccountStatus } from "@/features/account/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type AuthMode = "login" | "signup";

export function AuthForm() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAccountStatus);
  const error = useAppSelector(selectAccountError);
  const notice = useAppSelector(selectAccountNotice);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLoading = status === "loading";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "signup") {
      dispatch(signUpWithEmail({ email, password }))
        .unwrap()
        .then((result) => {
          if (!result?.user) {
            setMode("login");
            setPassword("");
          }
        })
        .catch(() => undefined);
      return;
    }

    dispatch(signInWithEmail({ email, password }));
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-4 text-slate-100">
      <section className="w-full max-w-sm rounded-lg border border-white/10 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-normal">Texas Hold&apos;em</h1>
          <p className="mt-1 text-sm text-slate-300">Sign in to play with persistent chips.</p>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-md border border-white/10 bg-slate-950 p-1">
          <button
            className={[
              "h-9 rounded text-sm font-semibold",
              mode === "login" ? "bg-amber-300 text-slate-950" : "text-slate-200 hover:bg-white/10"
            ].join(" ")}
            onClick={() => setMode("login")}
            type="button"
          >
            Log in
          </button>
          <button
            className={[
              "h-9 rounded text-sm font-semibold",
              mode === "signup" ? "bg-amber-300 text-slate-950" : "text-slate-200 hover:bg-white/10"
            ].join(" ")}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm font-semibold">
            Email
            <input
              autoComplete="email"
              className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-amber-300"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Password
            <input
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-amber-300"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <button
            className="mt-2 h-10 rounded-md bg-amber-300 px-4 text-sm font-bold text-slate-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Working..." : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-md border border-red-300/30 bg-red-950/60 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className="mt-4 rounded-md border border-amber-300/30 bg-amber-950/50 px-3 py-2 text-sm text-amber-100">
            {notice}
          </p>
        ) : null}
      </section>
    </main>
  );
}
