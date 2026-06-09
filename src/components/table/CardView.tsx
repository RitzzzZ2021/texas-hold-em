import { formatCard } from "@/core/poker/cards";
import type { Card } from "@/core/poker/types";

interface CardViewProps {
  card?: Card;
  hidden?: boolean;
}

export function CardView({ card, hidden = false }: CardViewProps) {
  if (hidden || !card) {
    return (
      <div className="grid h-20 w-14 place-items-center rounded-md border border-sky-200/30 bg-sky-950 shadow-md">
        <span className="h-8 w-8 rounded-full border border-sky-200/30" />
      </div>
    );
  }

  const isRed = card.suit === "diamonds" || card.suit === "hearts";

  return (
    <div className="flex h-20 w-14 flex-col justify-between rounded-md border border-slate-200 bg-white p-2 text-slate-950 shadow-md">
      <span className={isRed ? "text-red-600" : "text-slate-950"}>{card.rank}</span>
      <span className={isRed ? "self-end text-red-600" : "self-end text-slate-950"}>{formatCard(card).slice(-1)}</span>
    </div>
  );
}
