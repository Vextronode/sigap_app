import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useTheme } from "./hooks/useTheme";
import { cacheBasemapForOffline } from "./components/map/basemap";
import { queryClient } from "./services/queryClient";

export default function App() {
  useTheme();

  // Unduh peta dasar untuk offline di latar belakang, setelah data dashboard dan alert
  // selesai dimuat agar tidak berebut jaringan pada sinyal lemah.
  useEffect(() => {
    let started = false;
    let unsubscribe: (() => void) | undefined;
    const start = () => {
      if (started || queryClient.isFetching() > 0) return;
      started = true;
      unsubscribe?.();
      cacheBasemapForOffline().catch((error) =>
        console.warn("[Basemap] Gagal menyimpan peta untuk offline:", error)
      );
    };
    const timer = setTimeout(() => {
      unsubscribe = queryClient.getQueryCache().subscribe(start);
      start();
    }, 3_000);
    return () => {
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  return <RouterProvider router={router} />;
}
