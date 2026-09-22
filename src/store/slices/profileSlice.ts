import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfileData {
  avatarSrc: string;
  userFullName: string;
  email: string;
  mobile: string;
  isEmailVerified: boolean;
  updatedAt: string;
  userAvatar: string | null;
  purchasePoint: number;
  /** GET /user-profile returns this too, alongside the update response —
   * it just wasn't in this type yet, so the Edit Profile modal never had a
   * value to prefill its Address field with. */
  address?: string;
}

export interface ProfileState {
  data: UserProfileData | null;
  isFetched: boolean;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: ProfileState = {
  data: null,
  isFetched: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileData(state, action: PayloadAction<UserProfileData>) {
      state.data = action.payload;
      state.isFetched = true;
    },
    clearProfileData(state) {
      state.data = null;
      state.isFetched = false;
    },
  },
});

export const { setProfileData, clearProfileData } = profileSlice.actions;
export default profileSlice.reducer;
