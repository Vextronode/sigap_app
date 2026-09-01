import { Contact, Home, Map, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useUiStore } from "../stores/uiStore"; // Pastikan path store sesuai

const mobileLinks = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Evakuasi", href: "/#evacuation", icon: Map },
  { label: "Kontak", href: "/#contacts", icon: Contact },
  { label: "Info", href: "/#announcements", icon: Megaphone },
];

export const MobileNav = () => {
  const closeSidebar = useUiStore((state) => state.closeSidebar);

  return (
    <nav className="mobile-nav" aria-label="Navigasi cepat">
      {mobileLinks.map((item) => {
        const Icon = item.icon;
        const isRoute = item.href === "/";

        return isRoute ? (
          <Link to={item.href} key={item.href} onClick={closeSidebar}>
            <Icon size={19} />
            <span className="text-[11px] mt-0.5 font-medium">{item.label}</span>
          </Link>
        ) : (
          <a href={item.href} key={item.href} onClick={closeSidebar}>
            <Icon size={19} />
            <span className="text-[11px] mt-0.5 font-medium">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
};