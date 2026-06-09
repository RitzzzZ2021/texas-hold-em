"use client";

import { signOutAccount } from "@/features/account/accountSlice";
import { selectAccountProfile, selectAccountUser } from "@/features/account/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function AccountBar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAccountUser);
  const profile = useAppSelector(selectAccountProfile);

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-white/10 bg-slate-950/70 px-3 py-2 text-sm">
      <div>
        <p className="font-semibold text-slate-100">{user.email}</p>
        <p className="text-xs text-slate-300">Chips ${profile.chips}</p>
      </div>
      <button
        className="h-8 rounded border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/10"
        onClick={() => dispatch(signOutAccount())}
        type="button"
      >
        Sign out
      </button>
    </div>
  );
}
