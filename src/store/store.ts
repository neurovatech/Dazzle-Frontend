import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import rootReducer, { RootState } from "./rootReducer";

// ─── Store ────────────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for redux-persist actions
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

// ─── Types ────────────────────────────────────────────────────────────────────
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type { RootState };
