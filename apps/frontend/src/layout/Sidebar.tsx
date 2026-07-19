import { useEffect, useState } from "react";
import {
  BookOpen,
  Cloud,
  Contact,
  Home,
  Map,
  Megaphone,
  Radio,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUiStore } from "../stores/uiStore";
import { getAlertMeta } from "../utils/status";
import type { CurrentAlert } from "../types/dashboard";

type SidebarProps = {
  alert?: CurrentAlert | null;
  isLoading?: boolean;
  isError?: boolean;
};

const sectionLinks = [
  { label: "Cuaca", href: "#weather", icon: Cloud },
  { label: "Gempa / Tsunami", href: "#earthquake", icon: Radio },
  { label: "Jalur Evakuasi", href: "#evacuation", icon: Map },
  { label: "Kontak Darurat", href: "#contacts", icon: Contact },
  { label: "Panduan", href: "#preparedness", icon: BookOpen },
  { label: "Pengumuman", href: "#announcements", icon: Megaphone },
];

export const Sidebar = ({ alert, isLoading = false, isError = false }: SidebarProps) => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const meta = getAlertMeta(alert);

  const [activeHash, setActiveHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const sections = sectionLinks
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => el !== null);

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", 
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (id) {
            setActiveHash(`#${id}`);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => observer.observe(section));

    const handleScrollTopDetection = () => {
      if (window.scrollY < 150) {
        setActiveHash("");
      }
    };
    window.addEventListener("scroll", handleScrollTopDetection);

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      window.removeEventListener("scroll", handleScrollTopDetection);
    };
  }, []);

  const handleDashboardClick = () => {
    closeSidebar();
    setActiveHash("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`} aria-label="Navigasi utama">
        <div className="sidebar__brand flex items-center p-4 relative justify-between">
          <div className="flex items-center">
            <Link 
              to="/" 
              onClick={handleDashboardClick} 
              aria-label="SIGAP Desa Cibenda"
              className="-ml-1.5 mr-3 flex-shrink-0 block"
            >
              <img 
                src="/assets/image/lambang-kabupaten-pangandaran.webp" 
                alt="Lambang Kabupaten Pangandaran" 
                className="w-14 h-14 object-contain" 
              />
            </Link>

            <div className="flex flex-col leading-tight">
              <strong className="text-gray-900 font-bold">SIGAP</strong>
              <span className="text-xs text-gray-500">Desa Cibenda</span>
            </div>
          </div>
          <button className="sidebar__close" type="button" onClick={closeSidebar} aria-label="Tutup menu">
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar__nav">
          <Link 
            to="/" 
            onClick={handleDashboardClick} 
            className={activeHash === "" || activeHash === "#" ? "active" : undefined}
          >
            <Home size={20} />
            Dashboard
          </Link>

          {sectionLinks.map((item) => {
            const Icon = item.icon;
            const isMenuLinkActive = activeHash === item.href;
            
            return (
              <a 
                href={item.href} 
                key={item.href} 
                onClick={() => { closeSidebar(); setActiveHash(item.href); }}
                className={isMenuLinkActive ? "active" : undefined}
              >
                <Icon size={20} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="sidebar__status">
          <span className={`status-dot status-dot--${isError ? "neutral" : meta.tone}`} />
          <div className="flex flex-col text-left leading-tight">
            <strong>
              {isLoading
                ? "Status: Memuat"
                : isError
                  ? "Status: Tidak tersedia"
                  : !alert
                    ? "Status: Belum ada"
                    : `Status: ${meta.label}`}
            </strong>
            <span className="text-xs text-gray-500 mt-0.5">
              {isError 
                ? "Koneksi alert belum tersedia" 
                : !alert 
                  ? "Menunggu alert tersimpan" 
                  : "Sistem terhubung"}
            </span>
          </div>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-overlay" aria-label="Tutup menu" onClick={closeSidebar} type="button" />}
    </>
  );
};