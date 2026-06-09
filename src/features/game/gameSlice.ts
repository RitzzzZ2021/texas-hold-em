import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { applyPlayerAction, createNewHand } from "@/core/poker/table";
import type { GameState, PlayerAction, TableConfig } from "@/core/poker/types";

export interface GameSliceState {
  table: GameState | null;
  lastError: string | null;
}

const defaultTableConfig: TableConfig = {
  smallBlind: 10,
  bigBlind: 20,
  startingStack: 1000,
  playerNames: ["You", "Ada", "Grace", "Linus", "Margaret", "Donald"]
};

const initialState: GameSliceState = {
  table: null,
  lastError: null
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    startNewHand(state, action: PayloadAction<TableConfig | undefined>) {
      state.table = createNewHand(action.payload ?? defaultTableConfig);
      state.lastError = null;
    },
    playerActed(state, action: PayloadAction<PlayerAction>) {
      if (!state.table) {
        state.lastError = "No active table.";
        return;
      }

      try {
        state.table = applyPlayerAction(state.table, action.payload);
        state.lastError = null;
      } catch (error) {
        state.lastError = error instanceof Error ? error.message : "Unable to apply player action.";
      }
    },
    clearGameError(state) {
      state.lastError = null;
    }
  }
});

export const { clearGameError, playerActed, startNewHand } = gameSlice.actions;
export default gameSlice.reducer;
