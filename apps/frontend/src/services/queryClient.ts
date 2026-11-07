import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default "online" menjeda query saat offline, sehingga cache service worker tidak terbaca.
      networkMode: "offlineFirst",
      // Saat offline retry dijeda dan query menggantung tanpa status error, jadi tidak diulang.
      retry: (failureCount) => navigator.onLine && failureCount < 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    },
  },
});
