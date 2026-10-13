import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.tsx";
import "./styles/global.css";
import "./styles/variables.css";
import "leaflet/dist/leaflet.css";
import { queryClient } from "./services/queryClient";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
