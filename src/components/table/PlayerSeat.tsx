import { CardView } from "./CardView";
import type { Player } from "@/core/poker/types";

interface PlayerSeatProps {
  player: Player;
  isActive: boolean;
  revealCards?: boolean;
}

export function PlayerSeat({ player, isActive, revealCards = false }: PlayerSeatProps) {
  return (
    <section
      className={[
        "min-w-40 rounded-lg border bg-slate-950/80 p-3 shadow-lg",
        isActive ? "border-amber-300" : "border-white/10",
        player.status === "folded" ? "opacity-55" : ""
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold leading-tight">{player.name}</h2>
          <p className="text-xs text-slate-300">${player.stack}</p>
        </div>
        {player.bet > 0 ? (
          <span className="rounded-full bg-chip-red px-2 py-1 text-xs font-semibold">${player.bet}</span>
        ) : null}
      </div>
      <div className="flex gap-2">
        {player.holeCards.map((card, index) => (
          <CardView key={`${player.id}-${card.rank}-${card.suit}`} card={card} hidden={!revealCards && index >= 0} />
        ))}
      </div>
    </section>
  );
}
