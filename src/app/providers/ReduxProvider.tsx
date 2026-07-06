"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, AppStore } from "@/store/store";

// ─── Redux Provider ───────────────────────────────────────────────────────────
// Wraps the app with Redux store and redux-persist gate.
// PersistGate delays rendering until persisted state is rehydrated from localStorage.

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(store);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
