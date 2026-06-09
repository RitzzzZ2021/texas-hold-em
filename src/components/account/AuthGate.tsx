"use client";

import { AuthForm } from "./AuthForm";
import { selectAccountStatus, selectAccountUser } from "@/features/account/selectors";
import { useAppSelector } from "@/store/hooks";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const status = useAppSelector(selectAccountStatus);
  const user = useAppSelector(selectAccountUser);

  if (status === "idle" || status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-4 text-slate-100">
        <div className="rounded-md border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold">
          Loading account...
        </div>
      </main>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return children;
}
