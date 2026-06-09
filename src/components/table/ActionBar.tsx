"use client";

import { playerActed, startNewHand } from "@/features/game/gameSlice";
import { selectActivePlayer, selectTable } from "@/features/game/selectors";
import { selectAccountProfile } from "@/features/account/selectors";
import { selectLanguage } from "@/features/preferences/selectors";
import { t } from "@/i18n/translations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const HERO_PLAYER_ID = "seat-1";

export function ActionBar() {
  const dispatch = useAppDispatch();
  const table = useAppSelector(selectTable);
  const activePlayer = useAppSelector(selectActivePlayer);
  const language = useAppSelector(selectLanguage);
  const profile = useAppSelector(selectAccountProfile);

  if (!table || !activePlayer) {
    return null;
  }

  const callAmount = Math.max(0, table.currentBet - activePlayer.bet);
  const startingStack = Math.max(1, profile?.chips ?? 1000);
  const startHandFromAccount = () =>
    dispatch(
      startNewHand({
        smallBlind: 10,
        bigBlind: 20,
        startingStack,
        playerNames: ["You", "Ada", "Grace", "Linus", "Margaret", "Donald"]
      })
    );

  if (table.street === "showdown") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          className="h-10 rounded-md bg-amber-300 px-4 text-sm font-bold text-slate-950 hover:bg-amber-200"
          onClick={startHandFromAccount}
          type="button"
        >
          {t(language, "newHand")}
        </button>
      </div>
    );
  }

  if (activePlayer.id !== HERO_PLAYER_ID) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="h-10 rounded-md border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200">
          {activePlayer.name} {t(language, "opponentThinking")}
        </div>
        <button
          className="h-10 rounded-md border border-white/10 bg-slate-900 px-4 text-sm font-semibold hover:bg-slate-800"
          onClick={startHandFromAccount}
          type="button"
        >
          {t(language, "newHand")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        className="h-10 rounded-md border border-white/10 bg-slate-900 px-4 text-sm font-semibold hover:bg-slate-800"
        onClick={startHandFromAccount}
        type="button"
      >
        {t(language, "newHand")}
      </button>
      <button
        className="h-10 rounded-md border border-white/10 bg-slate-900 px-4 text-sm font-semibold hover:bg-slate-800"
        onClick={() => dispatch(playerActed({ type: "fold", playerId: activePlayer.id }))}
        type="button"
      >
        {t(language, "fold")}
      </button>
      <button
        className="h-10 rounded-md border border-white/10 bg-slate-900 px-4 text-sm font-semibold hover:bg-slate-800"
        onClick={() =>
          dispatch(playerActed({ type: callAmount === 0 ? "check" : "call", playerId: activePlayer.id }))
        }
        type="button"
      >
        {callAmount === 0 ? t(language, "check") : `${t(language, "call")} $${callAmount}`}
      </button>
      <button
        className="h-10 rounded-md bg-amber-300 px-4 text-sm font-bold text-slate-950 hover:bg-amber-200"
        onClick={() => dispatch(playerActed({ type: "raise", playerId: activePlayer.id, amount: table.minRaise }))}
        type="button"
      >
        {t(language, "raise")} ${table.minRaise}
      </button>
    </div>
  );
}
