import { QueryClient } from "@tanstack/react-query";
import { isRateLimitError } from "./apiClient";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default "online" menjeda query saat offline, sehingga cache service worker tidak terbaca.
      networkMode: "offlineFirst",
      // Saat offline retry dijeda dan query menggantung tanpa status error, jadi tidak diulang.
      // 429 tidak diulang: mengulang hanya menambah beban saat lonjakan (TK-07).
      retry: (failureCount, error) =>
        navigator.onLine && failureCount < 1 && !isRateLimitError(error),
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    },
  },
});
