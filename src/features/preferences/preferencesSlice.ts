import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Language = "en" | "zh";

export interface PreferencesState {
  language: Language;
}

const initialState: PreferencesState = {
  language: "en"
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    }
  }
});

export const { setLanguage } = preferencesSlice.actions;
export default preferencesSlice.reducer;
