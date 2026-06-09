import type { RootState } from "@/store/store";

export const selectAccountUser = (state: RootState) => state.account.user;
export const selectAccountProfile = (state: RootState) => state.account.profile;
export const selectAccountStatus = (state: RootState) => state.account.status;
export const selectAccountError = (state: RootState) => state.account.error;
export const selectAccountNotice = (state: RootState) => state.account.notice;
