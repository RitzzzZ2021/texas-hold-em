import { evaluateSevenCardHand } from "./handEvaluator";
import type { GameState, Player, PlayerAction, Rank } from "./types";

const rankValues: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14
};

const madeHandStrength = {
  "high-card": 0.2,
  pair: 0.38,
  "two-pair": 0.58,
  "three-of-a-kind": 0.7,
  straight: 0.82,
  flush: 0.86,
  "full-house": 0.92,
  "four-of-a-kind": 0.97,
  "straight-flush": 1
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function getActivePlayer(state: GameState): Player {
  return state.players[state.activePlayerIndex];
}

function scorePreflop(player: Player): number {
  const [first, second] = player.holeCards;
  const high = Math.max(rankValues[first.rank], rankValues[second.rank]);
  const low = Math.min(rankValues[first.rank], rankValues[second.rank]);
  const isPair = first.rank === second.rank;
  const isSuited = first.suit === second.suit;
  const gap = high - low;

  let score = high / 18 + low / 40;

  if (isPair) {
    score = 0.45 + high / 22;
  }

  if (isSuited) {
    score += 0.08;
  }

  if (gap === 1) {
    score += 0.07;
  } else if (gap === 2) {
    score += 0.04;
  } else if (gap >= 5) {
    score -= 0.08;
  }

  return clamp(score);
}

function scorePartialBoard(state: GameState, player: Player): number {
  const cards = [...player.holeCards, ...state.communityCards];
  const rankCounts = new Map<Rank, number>();
  const suitCounts = new Map<string, number>();

  for (const card of cards) {
    rankCounts.set(card.rank, (rankCounts.get(card.rank) ?? 0) + 1);
    suitCounts.set(card.suit, (suitCounts.get(card.suit) ?? 0) + 1);
  }

  const counts = [...rankCounts.values()].sort((a, b) => b - a);
  const hasFlushDraw = [...suitCounts.values()].some((count) => count >= 4);
  const uniqueValues = [...rankCounts.keys()].map((rank) => rankValues[rank]).sort((a, b) => a - b);
  const hasStraightDraw = uniqueValues.some((value) => {
    const window = [value, value + 1, value + 2, value + 3];
    return window.filter((candidate) => uniqueValues.includes(candidate)).length >= 4;
  });

  let score = scorePreflop(player) * 0.45;

  if (counts[0] >= 3) {
    score += 0.42;
  } else if (counts[0] === 2) {
    score += 0.22;
  }

  if (counts[1] >= 2) {
    score += 0.18;
  }

  if (hasFlushDraw) {
    score += 0.12;
  }

  if (hasStraightDraw) {
    score += 0.1;
  }

  return clamp(score);
}

function scoreHand(state: GameState, player: Player): number {
  if (state.communityCards.length === 0) {
    return scorePreflop(player);
  }

  if (state.communityCards.length === 5) {
    const evaluation = evaluateSevenCardHand([...player.holeCards, ...state.communityCards]);
    const kickerBoost = Math.min(0.08, evaluation.rankValues[0] / 200);
    return clamp(madeHandStrength[evaluation.category] + kickerBoost);
  }

  return scorePartialBoard(state, player);
}

function canRaise(player: Player, amountToCall: number, minRaise: number): boolean {
  return player.stack > amountToCall + minRaise;
}

export function decideOpponentAction(state: GameState, random: () => number = Math.random): PlayerAction {
  const player = getActivePlayer(state);
  const amountToCall = Math.max(0, state.currentBet - player.bet);
  const strength = scoreHand(state, player);
  const pressure = amountToCall / Math.max(1, player.stack + player.bet);
  const willingness = clamp(strength - pressure * 0.9 + random() * 0.18 - 0.09);

  if (amountToCall === 0) {
    if (strength > 0.68 && canRaise(player, 0, state.minRaise) && random() < 0.45) {
      return { type: "raise", playerId: player.id, amount: state.minRaise };
    }

    return { type: "check", playerId: player.id };
  }

  if (willingness < 0.28) {
    return { type: "fold", playerId: player.id };
  }

  if (willingness > 0.76 && canRaise(player, amountToCall, state.minRaise) && random() < 0.35) {
    return { type: "raise", playerId: player.id, amount: state.minRaise };
  }

  return { type: "call", playerId: player.id };
}
