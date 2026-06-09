import type { Card, Rank, Suit } from "./types";

export const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
export const SUITS: Suit[] = ["clubs", "diamonds", "hearts", "spades"];

export function createDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));
}

export function shuffleDeck(deck: Card[], random: () => number = Math.random): Card[] {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function drawCards(deck: Card[], count: number): { drawn: Card[]; deck: Card[] } {
  if (count < 0) {
    throw new Error("Cannot draw a negative number of cards.");
  }

  if (deck.length < count) {
    throw new Error("Cannot draw more cards than remain in the deck.");
  }

  return {
    drawn: deck.slice(0, count),
    deck: deck.slice(count)
  };
}

export function formatCard(card: Card): string {
  const suitSymbols: Record<Card["suit"], string> = {
    clubs: "C",
    diamonds: "D",
    hearts: "H",
    spades: "S"
  };

  return `${card.rank}${suitSymbols[card.suit]}`;
}
