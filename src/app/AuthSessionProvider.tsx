"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { initializeAccount } from "@/features/account/accountSlice";
import { useAppDispatch } from "@/store/hooks";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAccount());

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      dispatch(initializeAccount());
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return children;
}
