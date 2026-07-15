import { Menu, Moon, Sun } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useUiStore } from "../stores/uiStore";
import type { CurrentAlert } from "../types/dashboard";
import { getAlertMeta } from "../utils/status";

type TopNavbarProps = {
  alert?: CurrentAlert | null;
};

export const TopNavbar = ({ alert }: TopNavbarProps) => {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const theme = useUiStore((state) => state.theme);
  const meta = getAlertMeta(alert);

  return (
    <header className="top-navbar">
      <button className="icon-button top-navbar__menu" type="button" onClick={toggleSidebar} aria-label="Buka menu">
        <Menu size={22} />
      </button>
      <div className="top-navbar__title">
        <strong>SIGAP Desa Cibenda</strong>
        <span>Sistem Informasi Gawat Darurat</span>
      </div>
      <div className="top-navbar__actions">
        <Badge tone={meta.tone}>Status: {meta.label}</Badge>
        <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Ganti tema">
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};
