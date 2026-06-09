"use client";

import { useEffect } from "react";
import { ActionBar } from "./ActionBar";
import { CardView } from "./CardView";
import { LanguageToggle } from "./LanguageToggle";
import { PlayerSeat } from "./PlayerSeat";
import { decideOpponentAction } from "@/core/poker/opponentAI";
import { playerActed, startNewHand } from "@/features/game/gameSlice";
import { selectLastGameError, selectTable } from "@/features/game/selectors";
import { selectLanguage } from "@/features/preferences/selectors";
import { t } from "@/i18n/translations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const HERO_PLAYER_ID = "seat-1";

export function PokerTable() {
  const dispatch = useAppDispatch();
  const table = useAppSelector(selectTable);
  const error = useAppSelector(selectLastGameError);
  const language = useAppSelector(selectLanguage);

  useEffect(() => {
    if (!table) {
      dispatch(startNewHand());
    }
  }, [dispatch, table]);

  useEffect(() => {
    if (!table || table.street === "showdown") {
      return;
    }

    const activePlayer = table.players[table.activePlayerIndex];

    if (activePlayer.id === HERO_PLAYER_ID) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(playerActed(decideOpponentAction(table)));
    }, 750 + Math.floor(Math.random() * 700));

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, table]);

  if (!table) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-4 text-slate-100">
        <div className="rounded-md border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold">
          {t(language, "shufflingDeck")}
        </div>
      </main>
    );
  }

  const activePlayer = table.players[table.activePlayerIndex];
  const heroPlayer = table.players[0];
  const opponents = table.players.slice(1);
  const winners = table.players.filter((player) => table.winnerIds.includes(player.id));
  const isShowdown = table.street === "showdown";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_center,#0a6659_0%,#063f35_45%,#111827_100%)] p-4 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col justify-between gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-normal md:text-3xl">{t(language, "appTitle")}</h1>
            <p className="text-sm text-slate-200">
              {table.street === "showdown"
                ? `${t(language, "hand")} ${table.handNumber} / ${table.street}`
                : `${t(language, "hand")} ${table.handNumber} / ${table.street} / ${activePlayer.name} ${t(
                    language,
                    "toAct"
                  )}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageToggle />
            <div className="rounded-md border border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-semibold">
              {t(language, "pot")} ${table.pots.reduce((sum, pot) => sum + pot.amount, 0)}
            </div>
          </div>
        </header>

        <div className="grid flex-1 grid-rows-[auto_1fr_auto] gap-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {opponents.map((player) => (
              <PlayerSeat
                key={player.id}
                player={player}
                isActive={player.id === activePlayer.id}
                revealCards={isShowdown}
              />
            ))}
          </div>

          <section className="grid place-items-center rounded-[50%] border-8 border-amber-900/70 bg-felt-800/90 p-8 shadow-2xl shadow-black/40">
            <div className="flex min-h-24 flex-wrap justify-center gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <CardView key={`community-${index}`} card={table.communityCards[index]} hidden={!table.communityCards[index]} />
              ))}
            </div>
          </section>

          <div className="grid gap-4">
            <div className="mx-auto">
              <PlayerSeat player={heroPlayer} isActive={heroPlayer.id === activePlayer.id} revealCards />
            </div>
            <ActionBar />
            {winners.length > 0 ? (
              <p className="mx-auto rounded-md border border-amber-300/40 bg-slate-950/75 px-3 py-2 text-sm font-semibold text-amber-100">
                {t(language, winners.length === 1 ? "winner" : "winners")}:{" "}
                {winners.map((winner) => winner.name).join(", ")}
              </p>
            ) : null}
            {error ? (
              <p className="mx-auto rounded-md border border-red-300/30 bg-red-950/60 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
