import { createDeck, drawCards, shuffleDeck } from "./cards";
import { evaluateSevenCardHand, type HandCategory, type HandEvaluation } from "./handEvaluator";
import type { GameState, Player, PlayerAction, TableConfig } from "./types";

const handCategoryValues: Record<HandCategory, number> = {
  "high-card": 1,
  pair: 2,
  "two-pair": 3,
  "three-of-a-kind": 4,
  straight: 5,
  flush: 6,
  "full-house": 7,
  "four-of-a-kind": 8,
  "straight-flush": 9
};

function createPlayers(config: TableConfig): Player[] {
  return config.playerNames.map((name, index) => ({
    id: `seat-${index + 1}`,
    name,
    stack: config.startingStack,
    bet: 0,
    holeCards: [],
    status: "active",
    isDealer: index === 0
  }));
}

function nextActiveIndex(players: Player[], fromIndex: number): number {
  for (let offset = 1; offset <= players.length; offset += 1) {
    const index = (fromIndex + offset) % players.length;
    if (players[index].status === "active" && players[index].stack > 0) {
      return index;
    }
  }

  return fromIndex;
}

function continuingPlayers(players: Player[]): Player[] {
  return players.filter((player) => player.status === "active" || player.status === "all-in");
}

function playersWhoCanAct(players: Player[]): Player[] {
  return players.filter((player) => player.status === "active" && player.stack > 0);
}

function commitBet(player: Player, amount: number): Player {
  const paid = Math.min(amount, player.stack);

  return {
    ...player,
    stack: player.stack - paid,
    bet: player.bet + paid,
    status: player.stack - paid === 0 ? "all-in" : player.status
  };
}

function resetRoundBets(players: Player[]): Player[] {
  return players.map((player) => ({
    ...player,
    bet: 0
  }));
}

function dealCommunityCards(state: GameState, count: number): GameState {
  const burn = drawCards(state.deck, 1);
  const deal = drawCards(burn.deck, count);

  return {
    ...state,
    deck: deal.deck,
    communityCards: [...state.communityCards, ...deal.drawn]
  };
}

function firstToActAfterDealer(players: Player[], dealerIndex: number): number {
  return nextActiveIndex(players, dealerIndex);
}

function nextStreet(street: GameState["street"]): GameState["street"] {
  if (street === "preflop") {
    return "flop";
  }

  if (street === "flop") {
    return "turn";
  }

  if (street === "turn") {
    return "river";
  }

  return "showdown";
}

function isBettingRoundComplete(state: GameState): boolean {
  const actors = playersWhoCanAct(state.players);

  if (continuingPlayers(state.players).length <= 1 || actors.length <= 1) {
    return true;
  }

  return actors.every((player) => state.actedPlayerIds.includes(player.id) && player.bet === state.currentBet);
}

function compareEvaluations(a: HandEvaluation, b: HandEvaluation): number {
  const categoryDifference = handCategoryValues[a.category] - handCategoryValues[b.category];

  if (categoryDifference !== 0) {
    return categoryDifference;
  }

  for (let index = 0; index < Math.max(a.rankValues.length, b.rankValues.length); index += 1) {
    const difference = (a.rankValues[index] ?? 0) - (b.rankValues[index] ?? 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

function findWinnerIds(players: Player[], communityCards: GameState["communityCards"]): string[] {
  const remaining = continuingPlayers(players);

  if (remaining.length === 1) {
    return [remaining[0].id];
  }

  if (communityCards.length !== 5) {
    return [];
  }

  let best: HandEvaluation | null = null;
  let winnerIds: string[] = [];

  for (const player of remaining) {
    const evaluation = evaluateSevenCardHand([...player.holeCards, ...communityCards]);

    if (!best) {
      best = evaluation;
      winnerIds = [player.id];
      continue;
    }

    const comparison = compareEvaluations(evaluation, best);

    if (comparison > 0) {
      best = evaluation;
      winnerIds = [player.id];
    } else if (comparison === 0) {
      winnerIds = [...winnerIds, player.id];
    }
  }

  return winnerIds;
}

function settleHand(state: GameState, winnerIds: string[]): GameState {
  if (state.isSettled || winnerIds.length === 0) {
    return {
      ...state,
      winnerIds
    };
  }

  const totalPot = state.pots.reduce((sum, pot) => sum + pot.amount, 0);
  const baseShare = Math.floor(totalPot / winnerIds.length);
  let remainder = totalPot % winnerIds.length;

  const players = state.players.map((player) => {
    if (!winnerIds.includes(player.id)) {
      return player;
    }

    const extraChip = remainder > 0 ? 1 : 0;
    remainder -= extraChip;

    return {
      ...player,
      stack: player.stack + baseShare + extraChip
    };
  });

  return {
    ...state,
    players,
    winnerIds,
    isSettled: true
  };
}

function advanceStreetIfNeeded(state: GameState): GameState {
  const winnerIds = findWinnerIds(state.players, state.communityCards);

  if (winnerIds.length > 0) {
    return settleHand({
      ...state,
      street: "showdown"
    }, winnerIds);
  }

  if (!isBettingRoundComplete(state)) {
    return state;
  }

  let nextState: GameState = {
    ...state,
    players: resetRoundBets(state.players),
    street: nextStreet(state.street),
    currentBet: 0,
    activePlayerIndex: firstToActAfterDealer(state.players, state.dealerIndex),
    actedPlayerIds: []
  };

  if (nextState.street === "flop") {
    nextState = dealCommunityCards(nextState, 3);
  } else if (nextState.street === "turn" || nextState.street === "river") {
    nextState = dealCommunityCards(nextState, 1);
  }

  if (nextState.street === "showdown") {
    const showdownState = {
      ...nextState,
      activePlayerIndex: nextState.dealerIndex
    };

    return settleHand(showdownState, findWinnerIds(showdownState.players, showdownState.communityCards));
  }

  if (playersWhoCanAct(nextState.players).length <= 1) {
    return advanceStreetIfNeeded(nextState);
  }

  return nextState;
}

export function createNewHand(config: TableConfig): GameState {
  if (config.playerNames.length < 2) {
    throw new Error("Texas Hold'em requires at least two players.");
  }

  let deck = shuffleDeck(createDeck());
  let players = createPlayers(config);
  const initialStacks = Object.fromEntries(players.map((player) => [player.id, player.stack]));

  for (let cardIndex = 0; cardIndex < 2; cardIndex += 1) {
    players = players.map((player) => {
      const result = drawCards(deck, 1);
      deck = result.deck;

      return {
        ...player,
        holeCards: [...player.holeCards, result.drawn[0]]
      };
    });
  }

  const smallBlindIndex = players.length === 2 ? 0 : 1;
  const bigBlindIndex = players.length === 2 ? 1 : 2;
  players = players.map((player, index) => {
    if (index === smallBlindIndex) {
      return commitBet(player, config.smallBlind);
    }

    if (index === bigBlindIndex) {
      return commitBet(player, config.bigBlind);
    }

    return player;
  });

  return {
    id: crypto.randomUUID(),
    deck,
    communityCards: [],
    players,
    pots: [
      {
        amount: config.smallBlind + config.bigBlind,
        eligiblePlayerIds: players.map((player) => player.id)
      }
    ],
    dealerIndex: 0,
    activePlayerIndex: nextActiveIndex(players, bigBlindIndex),
    street: "preflop",
    currentBet: config.bigBlind,
    minRaise: config.bigBlind,
    handNumber: 1,
    actedPlayerIds: [],
    winnerIds: [],
    initialStacks,
    isSettled: false
  };
}

export function applyPlayerAction(state: GameState, action: PlayerAction): GameState {
  if (state.street === "showdown") {
    throw new Error("This hand is already complete.");
  }

  const playerIndex = state.players.findIndex((player) => player.id === action.playerId);

  if (playerIndex === -1) {
    throw new Error(`Player ${action.playerId} is not seated at this table.`);
  }

  if (playerIndex !== state.activePlayerIndex) {
    throw new Error("It is not this player's turn.");
  }

  const player = state.players[playerIndex];
  let players = [...state.players];
  let currentBet = state.currentBet;
  let minRaise = state.minRaise;
  let potDelta = 0;
  let actedPlayerIds = [...state.actedPlayerIds, player.id];

  if (action.type === "fold") {
    players[playerIndex] = { ...player, status: "folded" };
  }

  if (action.type === "check") {
    if (player.bet !== currentBet) {
      throw new Error("Cannot check while facing a bet.");
    }
  }

  if (action.type === "call") {
    const amountToCall = currentBet - player.bet;
    players[playerIndex] = commitBet(player, amountToCall);
    potDelta = Math.min(amountToCall, player.stack);
  }

  if (action.type === "raise") {
    const amountToCall = currentBet - player.bet;
    const totalCommitment = amountToCall + action.amount;

    if (action.amount < minRaise) {
      throw new Error(`Minimum raise is ${minRaise}.`);
    }

    players[playerIndex] = commitBet(player, totalCommitment);
    potDelta = Math.min(totalCommitment, player.stack);
    currentBet = player.bet + totalCommitment;
    minRaise = action.amount;
    actedPlayerIds = [player.id];
  }

  const activePlayerIndex = nextActiveIndex(players, playerIndex);

  return advanceStreetIfNeeded({
    ...state,
    players,
    pots: [{ ...state.pots[0], amount: state.pots[0].amount + potDelta }],
    activePlayerIndex,
    currentBet,
    minRaise,
    actedPlayerIds
  });
}
