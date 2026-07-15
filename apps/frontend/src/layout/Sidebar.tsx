import {
  BookOpen,
  Cloud,
  Contact,
  Home,
  Map,
  Megaphone,
  Radio,
  Waves,
  X,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useUiStore } from "../stores/uiStore";
import { getAlertMeta } from "../utils/status";
import type { CurrentAlert } from "../types/dashboard";

type SidebarProps = {
  alert?: CurrentAlert | null;
};

const sectionLinks = [
  { label: "Cuaca", href: "/#weather", icon: Cloud },
  { label: "Gempa", href: "/#earthquake", icon: Radio },
  { label: "Tsunami", href: "/#tsunami", icon: Waves },
  { label: "Jalur Evakuasi", href: "/#evacuation", icon: Map },
  { label: "Kontak Darurat", href: "/#contacts", icon: Contact },
  { label: "Panduan", href: "/#preparedness", icon: BookOpen },
  { label: "Pengumuman", href: "/#announcements", icon: Megaphone },
];

export const Sidebar = ({ alert }: SidebarProps) => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const meta = getAlertMeta(alert);

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`} aria-label="Navigasi utama">
        <div className="sidebar__brand">
          <Link to="/" onClick={closeSidebar} className="brand-mark" aria-label="SIGAP Desa Cibenda">
            S
          </Link>
          <div>
            <strong>SIGAP</strong>
            <span>Desa Cibenda</span>
          </div>
          <button className="sidebar__close" type="button" onClick={closeSidebar} aria-label="Tutup menu">
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/" onClick={closeSidebar} className={({ isActive }) => (isActive ? "active" : undefined)}>
            <Home size={20} />
            Dashboard
          </NavLink>
          {sectionLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a href={item.href} key={item.href} onClick={closeSidebar}>
                <Icon size={20} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="sidebar__status">
          <span className={`status-dot status-dot--${meta.tone}`} />
          <div>
            <strong>Status: {meta.label}</strong>
            <span>Sistem terhubung</span>
          </div>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-overlay" aria-label="Tutup menu" onClick={closeSidebar} type="button" />}
    </>
  );
};
