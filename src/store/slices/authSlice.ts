import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  usersCommuuid: string;
  userFullName: string;
  email: string;
  emailVerifiedToken: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  apiKey: string | null;
  token: string | null; // JWT Bearer token
  isEmailVerified: boolean;
}

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  apiKey: null,
  token: null,
  isEmailVerified: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called after successful registration
    setRegistrationData(
      state,
      action: PayloadAction<{
        user: AuthUser;
        apiKey: string;
        token: string;
      }>
    ) {
      state.user = action.payload.user;
      state.apiKey = action.payload.apiKey;
      state.token = action.payload.token;
      state.isAuthenticated = false; // not yet verified
      state.isEmailVerified = false;
    },

    // Called after successful email verification
    setEmailVerified(
      state,
      action: PayloadAction<{
        apiKey: string;
        token: string;
      }>
    ) {
      state.isEmailVerified = true;
      state.isAuthenticated = true;
      state.apiKey = action.payload.apiKey;
      state.token = action.payload.token;
    },

    // Called on login
    setCredentials(
      state,
      action: PayloadAction<{
        user: AuthUser;
        apiKey: string;
        token: string;
      }>
    ) {
      state.isAuthenticated = true;
      state.isEmailVerified = true;
      state.user = action.payload.user;
      state.apiKey = action.payload.apiKey;
      state.token = action.payload.token;
    },

    // Called on logout
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.apiKey = null;
      state.token = null;
      state.isEmailVerified = false;
    },
  },
});

export const {
  setRegistrationData,
  setEmailVerified,
  setCredentials,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
