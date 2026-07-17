import { create } from "zustand";

export type ThemeMode = "light" | "dark";

type UiState = {
  theme: ThemeMode;
  sidebarOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const getInitialTheme = (): ThemeMode => {
  const storedTheme = localStorage.getItem("sigap_theme");
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const useUiStore = create<UiState>((set, get) => ({
  theme: getInitialTheme(),
  sidebarOpen: false,
  setTheme: (theme) => {
    localStorage.setItem("sigap_theme", theme);
    set({ theme });
  },
  toggleTheme: () => {
    const theme = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("sigap_theme", theme);
    set({ theme });
  },
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
