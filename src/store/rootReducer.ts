import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import siteSettingsReducer from "./slices/siteSettingsSlice";
import wishlistReducer from "./slices/wishlistSlice";

// ─── SSR-safe storage ─────────────────────────────────────────────────────────

function createNoopStorage() {
  return {
    getItem(): Promise<null> {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: unknown): Promise<unknown> {
      return Promise.resolve(value);
    },
    removeItem(): Promise<void> {
      return Promise.resolve();
    },
  };
}

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

// ─── Persist Configs ──────────────────────────────────────────────────────────

const authPersistConfig = {
  key: "dazzle_auth",
  storage,
  whitelist: ["isAuthenticated", "user", "apiKey", "token", "isEmailVerified"],
};

const profilePersistConfig = {
  key: "dazzle_profile",
  storage,
  whitelist: ["data", "isFetched"],
};

// siteSettings — 30 min stale, page reload-এ persist থাকবে
const siteSettingsPersistConfig = {
  key: "dazzle_site_settings",
  storage,
  whitelist: ["data", "isFetched"],
};

const wishlistPersistConfig = {
  key: "dazzle_wishlist",
  storage,
  whitelist: ["items"],
};

// ─── Root Reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  auth:         persistReducer(authPersistConfig, authReducer),
  profile:      persistReducer(profilePersistConfig, profileReducer),
  siteSettings: persistReducer(siteSettingsPersistConfig, siteSettingsReducer),
  wishlist:     persistReducer(wishlistPersistConfig, wishlistReducer),
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
