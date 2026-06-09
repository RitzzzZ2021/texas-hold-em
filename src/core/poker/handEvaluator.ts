import { RANKS } from "./cards";
import type { Card, Rank } from "./types";

export type HandCategory =
  | "high-card"
  | "pair"
  | "two-pair"
  | "three-of-a-kind"
  | "straight"
  | "flush"
  | "full-house"
  | "four-of-a-kind"
  | "straight-flush";

export interface HandEvaluation {
  category: HandCategory;
  rankValues: number[];
  cards: Card[];
}

const rankValue = new Map(RANKS.map((rank, index) => [rank, index + 2]));

function cardValue(card: Card): number {
  return rankValue.get(card.rank)!;
}

function sortedByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => cardValue(b) - cardValue(a));
}

function findStraight(cards: Card[]): { high: number; cards: Card[] } | null {
  const sortedCards = sortedByRank(cards);
  const byValue = new Map<number, Card>();

  for (const card of sortedCards) {
    byValue.set(cardValue(card), card);
  }

  if (byValue.has(14)) {
    byValue.set(1, byValue.get(14)!);
  }

  const values = [...byValue.keys()].sort((a, b) => b - a);

  for (const high of values) {
    const run = [high, high - 1, high - 2, high - 3, high - 4];

    if (run.every((value) => byValue.has(value))) {
      return {
        high: high === 1 ? 5 : high,
        cards: run.map((value) => byValue.get(value)!)
      };
    }
  }

  return null;
}

export function evaluateSevenCardHand(cards: Card[]): HandEvaluation {
  if (cards.length !== 7) {
    throw new Error("A Hold'em showdown evaluation requires exactly seven cards.");
  }

  const sortedCards = sortedByRank(cards);
  const rankCounts = new Map<Rank, number>();

  for (const card of sortedCards) {
    rankCounts.set(card.rank, (rankCounts.get(card.rank) ?? 0) + 1);
  }

  const groups = [...rankCounts.entries()]
    .map(([rank, count]) => ({ rank, count, value: rankValue.get(rank)! }))
    .sort((a, b) => b.count - a.count || b.value - a.value);

  const flushSuit = ["clubs", "diamonds", "hearts", "spades"].find(
    (suit) => sortedCards.filter((card) => card.suit === suit).length >= 5
  );

  if (flushSuit) {
    const straightFlush = findStraight(sortedCards.filter((card) => card.suit === flushSuit));

    if (straightFlush) {
      return {
        category: "straight-flush",
        rankValues: [straightFlush.high],
        cards: straightFlush.cards
      };
    }
  }

  if (groups[0].count === 4) {
    const four = sortedCards.filter((card) => card.rank === groups[0].rank);
    const kicker = sortedCards.find((card) => card.rank !== groups[0].rank)!;
    return {
      category: "four-of-a-kind",
      rankValues: [groups[0].value, cardValue(kicker)],
      cards: [...four, kicker]
    };
  }

  const trips = groups.filter((group) => group.count >= 3);
  const pairGroups = groups.filter((group) => group.count >= 2);
  if (trips.length > 0 && pairGroups.some((group) => group.rank !== trips[0].rank)) {
    const pair = pairGroups.find((group) => group.rank !== trips[0].rank)!;
    return {
      category: "full-house",
      rankValues: [trips[0].value, pair.value],
      cards: [
        ...sortedCards.filter((card) => card.rank === trips[0].rank).slice(0, 3),
        ...sortedCards.filter((card) => card.rank === pair.rank).slice(0, 2)
      ]
    };
  }

  if (flushSuit) {
    const flushCards = sortedCards.filter((card) => card.suit === flushSuit).slice(0, 5);
    return {
      category: "flush",
      rankValues: flushCards.map(cardValue),
      cards: flushCards
    };
  }

  const straight = findStraight(sortedCards);
  if (straight) {
    return {
      category: "straight",
      rankValues: [straight.high],
      cards: straight.cards
    };
  }

  if (groups[0].count === 3) {
    const tripCards = sortedCards.filter((card) => card.rank === groups[0].rank);
    const kickers = sortedCards.filter((card) => card.rank !== groups[0].rank).slice(0, 2);
    return {
      category: "three-of-a-kind",
      rankValues: [groups[0].value, ...kickers.map(cardValue)],
      cards: [...tripCards, ...kickers]
    };
  }

  const pairs = groups.filter((group) => group.count === 2);
  if (pairs.length >= 2) {
    const selectedPairs = pairs.slice(0, 2);
    const kicker = sortedCards.find((card) => !selectedPairs.some((pair) => pair.rank === card.rank))!;
    return {
      category: "two-pair",
      rankValues: [...selectedPairs.map((pair) => pair.value), cardValue(kicker)],
      cards: [
        ...selectedPairs.flatMap((pair) => sortedCards.filter((card) => card.rank === pair.rank).slice(0, 2)),
        kicker
      ]
    };
  }

  if (pairs.length === 1) {
    const pair = pairs[0];
    const pairCards = sortedCards.filter((card) => card.rank === pair.rank);
    const kickers = sortedCards.filter((card) => card.rank !== pair.rank).slice(0, 3);
    return {
      category: "pair",
      rankValues: [pair.value, ...kickers.map(cardValue)],
      cards: [...pairCards, ...kickers]
    };
  }

  return {
    category: "high-card",
    rankValues: sortedCards.slice(0, 5).map(cardValue),
    cards: sortedCards.slice(0, 5)
  };
}
