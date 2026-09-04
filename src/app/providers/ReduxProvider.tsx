"use client";
import { Provider } from "react-redux";
import { store } from "@/store/store";

import SessionExpiredModal from "@/components/Auth/SessionExpiredModal";

// ─── Redux Provider ───────────────────────────────────────────────────────────
// Wraps the app with the Redux store.
//
// Deliberately NOT gated behind <PersistGate>. PersistGate blocks rendering of
// `children` until redux-persist finishes rehydrating from localStorage — on
// the server that rehydration promise never resolves (no `window`), so the
// gate rendered `null` for the entire app on every SSR pass. That made every
// route's server-rendered HTML body empty (crawlers saw no content; only
// generateMetadata()'s <title>/<meta> tags were unaffected).
//
// Every persisted slice (auth, profile, siteSettings, wishlist, cart) is read
// via `useAppSelector` directly at the point of use rather than snapshotted
// into local state, so components re-render on their own once redux-persist's
// REHYDRATE action lands client-side — no gate is needed to avoid stale data.
export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      {children}
      <SessionExpiredModal />
    </Provider>
  );
}
