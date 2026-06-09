import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "@/features/game/gameSlice";
import preferencesReducer from "@/features/preferences/preferencesSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    preferences: preferencesReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
