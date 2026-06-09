"use client";

import { AccountBar } from "@/components/account/AccountBar";
import { CardView } from "@/components/table/CardView";
import { LanguageToggle } from "@/components/table/LanguageToggle";
import { PokerTable } from "@/components/table/PokerTable";
import { selectAccountProfile } from "@/features/account/selectors";
import { startNewHand } from "@/features/game/gameSlice";
import { selectTable } from "@/features/game/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const previewSeats = ["You", "Ada", "Grace", "Linus", "Margaret", "Donald"];

function BlurredTablePreview() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_center,#0a6659_0%,#063f35_45%,#111827_100%)] p-4 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col justify-between gap-6 blur-sm">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-normal md:text-3xl">Texas Hold'em</h1>
            <p className="text-sm text-slate-200">Ready room</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AccountBar />
            <LanguageToggle />
            <div className="rounded-md border border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-semibold">
              Pot $0
            </div>
          </div>
        </header>

        <div className="grid flex-1 grid-rows-[auto_1fr_auto] gap-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {previewSeats.slice(1).map((name) => (
              <section className="min-w-40 rounded-lg border border-white/10 bg-slate-950/80 p-3 shadow-lg" key={name}>
                <div className="mb-3">
                  <h2 className="text-sm font-semibold leading-tight">{name}</h2>
                  <p className="text-xs text-slate-300">$1000</p>
                </div>
                <div className="flex gap-2">
                  <CardView hidden />
                  <CardView hidden />
                </div>
              </section>
            ))}
          </div>

          <section className="grid place-items-center rounded-[50%] border-8 border-amber-900/70 bg-felt-800/90 p-8 shadow-2xl shadow-black/40">
            <div className="flex min-h-24 flex-wrap justify-center gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <CardView hidden key={`preview-community-${index}`} />
              ))}
            </div>
          </section>

          <div className="mx-auto">
            <section className="min-w-40 rounded-lg border border-white/10 bg-slate-950/80 p-3 shadow-lg">
              <div className="mb-3">
                <h2 className="text-sm font-semibold leading-tight">You</h2>
                <p className="text-xs text-slate-300">$1000</p>
              </div>
              <div className="flex gap-2">
                <CardView hidden />
                <CardView hidden />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export function GameLobby() {
  const dispatch = useAppDispatch();
  const table = useAppSelector(selectTable);
  const profile = useAppSelector(selectAccountProfile);

  if (table) {
    return <PokerTable />;
  }

  const startingStack = Math.max(1, profile?.chips ?? 1000);

  return (
    <div className="relative min-h-screen">
      <BlurredTablePreview />
      <div className="absolute inset-0 grid place-items-center bg-slate-950/35 p-4">
        <section className="w-full max-w-sm rounded-lg border border-white/10 bg-slate-950/90 p-5 text-center shadow-2xl">
          <h1 className="text-2xl font-bold tracking-normal text-slate-100">Ready to play?</h1>
          <p className="mt-2 text-sm text-slate-300">Start a hand when you are seated at the table.</p>
          <button
            className="mt-5 h-11 w-full rounded-md bg-amber-300 px-4 text-sm font-bold text-slate-950 hover:bg-amber-200"
            onClick={() =>
              dispatch(
                startNewHand({
                  smallBlind: 10,
                  bigBlind: 20,
                  startingStack,
                  playerNames: ["You", "Ada", "Grace", "Linus", "Margaret", "Donald"]
                })
              )
            }
            type="button"
          >
            Start game
          </button>
        </section>
      </div>
    </div>
  );
}
