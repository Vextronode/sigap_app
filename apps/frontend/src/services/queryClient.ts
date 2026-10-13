import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    },
  },
});
