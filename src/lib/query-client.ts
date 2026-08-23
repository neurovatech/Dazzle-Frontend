import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent refetching when switching browser tabs or refocusing window
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Default stale time: 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep in cache for 30 minutes
        gcTime: 30 * 60 * 1000,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
