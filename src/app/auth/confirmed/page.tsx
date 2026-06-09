"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function EmailConfirmedPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.signOut().finally(() => {
      router.replace("/");
    });
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-4 text-slate-100">
      <div className="rounded-md border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold">
        Email confirmed. Sending you to log in...
      </div>
    </main>
  );
}
