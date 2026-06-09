import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase/client";
import type { AccountProfile, AccountUser } from "./types";

const INITIAL_CHIPS = 1000;

export interface AccountState {
  user: AccountUser | null;
  profile: AccountProfile | null;
  status: "idle" | "loading" | "authenticated" | "anonymous";
  error: string | null;
  notice: string | null;
}

const initialState: AccountState = {
  user: null,
  profile: null,
  status: "idle",
  error: null,
  notice: null
};

async function ensureProfile(user: AccountUser): Promise<AccountProfile> {
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id,email,chips")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingProfile) {
    return {
      id: existingProfile.id,
      email: existingProfile.email,
      chips: existingProfile.chips
    };
  }

  const { data: createdProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      chips: INITIAL_CHIPS
    })
    .select("id,email,chips")
    .single();

  if (insertError) {
    throw insertError;
  }

  return {
    id: createdProfile.id,
    email: createdProfile.email,
    chips: createdProfile.chips
  };
}

async function getCurrentAccount(): Promise<{ user: AccountUser; profile: AccountProfile } | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user?.email) {
    return null;
  }

  const user = {
    id: data.user.id,
    email: data.user.email
  };

  return {
    user,
    profile: await ensureProfile(user)
  };
}

export const initializeAccount = createAsyncThunk("account/initialize", async () => getCurrentAccount());

export const signUpWithEmail = createAsyncThunk(
  "account/signUpWithEmail",
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      return {
        user: null,
        profile: null,
        notice: "Check your email to confirm your account, then log in."
      };
    }

    if (!data.user?.email) {
      return {
        user: null,
        profile: null,
        notice: "Check your email to confirm your account, then log in."
      };
    }

    const user = {
      id: data.user.id,
      email: data.user.email
    };

    return {
      user,
      profile: await ensureProfile(user),
      notice: null
    };
  }
);

export const signInWithEmail = createAsyncThunk(
  "account/signInWithEmail",
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    if (!data.user.email) {
      throw new Error("Supabase did not return an email for this user.");
    }

    const user = {
      id: data.user.id,
      email: data.user.email
    };

    return {
      user,
      profile: await ensureProfile(user)
    };
  }
);

export const signOutAccount = createAsyncThunk("account/signOut", async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
});

export const applyChipDelta = createAsyncThunk("account/applyChipDelta", async (delta: number) => {
  const currentAccount = await getCurrentAccount();

  if (!currentAccount) {
    throw new Error("You must be signed in to update chips.");
  }

  const chips = Math.max(0, currentAccount.profile.chips + delta);
  const { data, error } = await supabase
    .from("profiles")
    .update({
      chips,
      updated_at: new Date().toISOString()
    })
    .eq("id", currentAccount.user.id)
    .select("id,email,chips")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    chips: data.chips
  };
});

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    clearAccountError(state) {
      state.error = null;
    },
    setAccountFromAuthEvent(state, action: PayloadAction<{ user: AccountUser; profile: AccountProfile } | null>) {
      if (!action.payload) {
        state.user = null;
        state.profile = null;
      state.status = "anonymous";
      state.notice = null;
      return;
      }

      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.status = "authenticated";
      state.error = null;
      state.notice = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.notice = null;
      })
      .addCase(initializeAccount.fulfilled, (state, action) => {
        state.user = action.payload?.user ?? null;
        state.profile = action.payload?.profile ?? null;
        state.status = action.payload ? "authenticated" : "anonymous";
        state.notice = null;
      })
      .addCase(initializeAccount.rejected, (state, action) => {
        state.status = "anonymous";
        state.error = action.error.message ?? "Unable to initialize account.";
        state.notice = null;
      })
      .addCase(signUpWithEmail.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.notice = null;
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        state.user = action.payload?.user ?? null;
        state.profile = action.payload?.profile ?? null;
        state.status = action.payload?.user ? "authenticated" : "anonymous";
        state.notice = action.payload?.notice ?? null;
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.status = "anonymous";
        state.error = action.error.message ?? "Unable to create account.";
        state.notice = null;
      })
      .addCase(signInWithEmail.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.notice = null;
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.status = "authenticated";
        state.notice = null;
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.status = "anonymous";
        state.error = action.error.message ?? "Unable to sign in.";
        state.notice = null;
      })
      .addCase(signOutAccount.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.status = "anonymous";
        state.error = null;
        state.notice = null;
      })
      .addCase(applyChipDelta.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(applyChipDelta.rejected, (state, action) => {
        state.error = action.error.message ?? "Unable to update chips.";
      });
  }
});

export const { clearAccountError, setAccountFromAuthEvent } = accountSlice.actions;
export default accountSlice.reducer;
