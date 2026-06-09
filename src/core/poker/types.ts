export type Suit = "clubs" | "diamonds" | "hearts" | "spades";

export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type PlayerStatus = "active" | "folded" | "all-in" | "out";

export interface Player {
  id: string;
  name: string;
  stack: number;
  bet: number;
  holeCards: Card[];
  status: PlayerStatus;
  isDealer: boolean;
}

export type Street = "preflop" | "flop" | "turn" | "river" | "showdown";

export interface Pot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface TableConfig {
  smallBlind: number;
  bigBlind: number;
  startingStack: number;
  playerNames: string[];
}

export interface GameState {
  id: string;
  deck: Card[];
  communityCards: Card[];
  players: Player[];
  pots: Pot[];
  dealerIndex: number;
  activePlayerIndex: number;
  street: Street;
  currentBet: number;
  minRaise: number;
  handNumber: number;
  actedPlayerIds: string[];
  winnerIds: string[];
  initialStacks: Record<string, number>;
  isSettled: boolean;
}

export type PlayerAction =
  | { type: "fold"; playerId: string }
  | { type: "check"; playerId: string }
  | { type: "call"; playerId: string }
  | { type: "raise"; playerId: string; amount: number };
