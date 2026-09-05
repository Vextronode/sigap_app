import { Menu, Moon, Sun } from "lucide-react";
import { VscAccount } from "react-icons/vsc";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { useUiStore } from "../stores/uiStore";
import { useAuthStore } from "../stores/authStore";
import type { CurrentAlert } from "../types/dashboard";
import { getAlertMeta } from "../utils/status";

type TopNavbarProps = {
  alert?: CurrentAlert | null;
  isLoading?: boolean;
  isError?: boolean;
};

export const TopNavbar = ({ alert, isLoading = false, isError = false }: TopNavbarProps) => {
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const theme = useUiStore((state) => state.theme);
  const meta = getAlertMeta(alert);
  const openSidebar = useUiStore((state) => state.openSidebar);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isOperator = user?.roles?.some((r) => r.toLowerCase().includes("operator"));
  const roleLabel = isOperator ? "OPERATOR" : "ADMIN";
  const showRoleStatus = isAdminRoute;

  return (
    <header className="top-navbar">
      <button 
        className="icon-button top-navbar__menu" 
        type="button" 
        onClick={openSidebar} 
        aria-label="Buka menu"
      >        
      <Menu size={22} />
      </button>
      <div className="top-navbar__title">
        <strong>{showRoleStatus ? "ADMIN SIGAP" : "SIGAP Desa Cibenda"}</strong>
        <span>Sistem Informasi Gawat Darurat & Monitoring Cuaca</span>
      </div>
      <div className="top-navbar__actions">
        {showRoleStatus ? (
          <Badge
            tone="neutral"
            className="tracking-wider dark:!bg-[color:var(--primary-50)] dark:!text-[color:var(--primary)] dark:border dark:border-[color:var(--primary)]/30"
          >
            {`STATUS: ${roleLabel}`}
          </Badge>
        ) : (
          <Badge tone={isError ? "neutral" : meta.tone}>
            {isLoading
              ? "Status: Memuat"
              : isError
                ? "Status: Tidak tersedia"
                : !alert
                  ? "Status: Belum ada"
                  : `Status: ${meta.label}`}
          </Badge>
        )}

        <Link
          to={isAdmin ? "/admin/dashboard" : "/admin/login"}
          className="icon-button text-[color:var(--text-muted)] dark:text-[color:var(--primary)] hover:border-[color:var(--primary)] transition-colors focus:outline-none"
          title={isAdmin ? "Dashboard Admin" : "Login Admin"}
          aria-label={isAdmin ? "Dashboard Admin" : "Login Admin"}
        >
          <VscAccount size={22} className="shrink-0" />
        </Link>

        <span className="w-px h-6 bg-[color:var(--border)] mx-1" aria-hidden="true" />

        <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Ganti tema">
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};
