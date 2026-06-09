import type { RootState } from "@/store/store";

export const selectTable = (state: RootState) => state.game.table;
export const selectLastGameError = (state: RootState) => state.game.lastError;

export const selectActivePlayer = (state: RootState) => {
  const table = selectTable(state);
  return table ? table.players[table.activePlayerIndex] : null;
};
