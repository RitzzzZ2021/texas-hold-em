import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "@/features/account/accountSlice";
import gameReducer from "@/features/game/gameSlice";
import preferencesReducer from "@/features/preferences/preferencesSlice";

export const store = configureStore({
  reducer: {
    account: accountReducer,
    game: gameReducer,
    preferences: preferencesReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
