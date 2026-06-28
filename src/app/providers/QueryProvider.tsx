"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { getQueryClient } from "@/lib/query-client";

export default function QueryProvider({ children }: { children: ReactNode }) {
  // Retrieve the QueryClient instance safely (browser persistent or server-scoped)
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
