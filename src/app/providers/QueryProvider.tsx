"use client";

import { QueryClientProvider, HydrationBoundary, DehydratedState } from "@tanstack/react-query";
import { ReactNode } from "react";
import { getQueryClient } from "@/lib/query-client";

export default function QueryProvider({
  children,
  state,
}: {
  children: ReactNode;
  state?: DehydratedState;
}) {
  // Retrieve the QueryClient instance safely (browser persistent or server-scoped)
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}
