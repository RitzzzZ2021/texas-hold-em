import type { RootState } from "@/store/store";

export const selectLanguage = (state: RootState) => state.preferences.language;
