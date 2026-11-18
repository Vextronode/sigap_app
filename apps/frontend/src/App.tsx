import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useTheme } from "./hooks/useTheme";
import { cacheBasemapForOffline } from "./components/map/basemap";

export default function App() {
  useTheme();

  // Unduh peta dasar untuk offline di latar belakang setelah halaman selesai dimuat.
  useEffect(() => {
    const run = () => {
      cacheBasemapForOffline().catch((error) =>
        console.warn("[Basemap] Gagal menyimpan peta untuk offline:", error)
      );
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 10_000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(run, 3_000);
    return () => clearTimeout(timer);
  }, []);

  return <RouterProvider router={router} />;
}
