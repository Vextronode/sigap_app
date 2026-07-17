import { Contact, Home, Map, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

const mobileLinks = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Evakuasi", href: "/#evacuation", icon: Map },
  { label: "Kontak", href: "/#contacts", icon: Contact },
  { label: "Info", href: "/#announcements", icon: Megaphone },
];

export const MobileNav = () => (
  <nav className="mobile-nav" aria-label="Navigasi cepat">
    {mobileLinks.map((item) => {
      const Icon = item.icon;
      const isRoute = item.href === "/";

      return isRoute ? (
        <Link to={item.href} key={item.href}>
          <Icon size={19} />
          {item.label}
        </Link>
      ) : (
        <a href={item.href} key={item.href}>
          <Icon size={19} />
          {item.label}
        </a>
      );
    })}
  </nav>
);
