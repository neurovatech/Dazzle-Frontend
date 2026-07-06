import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

// ─── Typed Hooks ──────────────────────────────────────────────────────────────
// Use these instead of plain `useDispatch` and `useSelector` throughout the app

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
