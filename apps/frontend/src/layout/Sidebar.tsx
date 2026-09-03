import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  CircleUser,
  Cloud,
  CloudRain,
  Contact,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Map,
  Megaphone,
  Radio,
  Settings,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUiStore } from "../stores/uiStore";
import { useAuthStore } from "../stores/authStore";
import { useDeviceStatus } from "../features/dashboard/hooks/useDeviceStatus";

// daftar tautan publik warga desa
const sectionLinks = [
  { label: "Cuaca", href: "#weather", icon: Cloud },
  { label: "Gempa / Tsunami", href: "#earthquake", icon: Radio },
  { label: "Jalur Evakuasi", href: "#evacuation", icon: Map },
  { label: "Kontak Darurat", href: "#contacts", icon: Contact },
  { label: "Panduan", href: "#preparedness", icon: BookOpen },
  { label: "Pengumuman", href: "#announcements", icon: Megaphone },
];

// daftar tautan utilitas khusus admin dalam bahasa indonesia
const adminLinks = [
  { label: "Dashboard Admin", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Log & Verifikasi Alert", href: "#alerts", icon: FileText },
  { label: "Monitoring Cuaca", href: "#weather", icon: CloudRain },
  { label: "Aktivitas Seismik", href: "#earthquake", icon: Activity },
  { label: "Kontrol Sirine & IoT", href: "/admin/sirine-iot", icon: Bell },
  { label: "Pengaturan Sistem", href: "/admin/manajemen-akun", icon: Settings },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const { data: deviceStatus, isLoading: isDeviceLoading, isError: isDeviceError } = useDeviceStatus();

  // state autentikasi admin dan modal profil
  const { isAdmin, user, logout } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
    closeSidebar();
    navigate("/admin/login");
  };

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

  const getDotClass = () => {
    if (isDeviceLoading) return "status-dot--neutral";
    if (
      isDeviceError ||
      !deviceStatus ||
      deviceStatus.status === "UNAVAILABLE" ||
      deviceStatus.tone === "neutral"
    ) {
      return "status-dot--neutral";
    }
    if (deviceStatus.status === "ONLINE" || deviceStatus.tone === "safe") {
      return "status-dot--safe status-dot--pulse";
    }
    return "status-dot--danger status-dot--pulse";
  };

  const getStatusLabel = () => {
    if (isDeviceLoading) return "Memeriksa Alat...";
    if (isDeviceError || !deviceStatus) return "Koneksi Alat Tidak Tersedia";
    return deviceStatus.label || "Koneksi Alat Tidak Tersedia";
  };

  const getLabelClass = () => {
    if (
      isDeviceLoading ||
      isDeviceError ||
      deviceStatus?.tone === "neutral" ||
      deviceStatus?.status === "UNAVAILABLE"
    ) {
      return "sidebar__device-label sidebar__device-label--neutral";
    }
    return "sidebar__device-label";
  };

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""} overflow-y-auto`} aria-label="Navigasi utama">
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
                key={item.label} 
                onClick={() => { closeSidebar(); setActiveHash(item.href); }}
                className={isMenuLinkActive ? "active" : undefined}
              >
                <Icon size={20} />
                {item.label}
              </a>
            );
          })}

          {/* section menu khusus admin jika sudah login */}
          {isAdmin && (
            <>
              <div className="pt-2">
                <hr className="sidebar__divider" />
                <span className="block px-3.5 mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  ADMIN
                </span>
              </div>

              {adminLinks.map((item) => {
                const Icon = item.icon;
                const isMenuLinkActive =
                  activeHash === item.href ||
                  (item.href.startsWith("/") && window.location.pathname === item.href);

                return (
                  <a
                    href={item.href}
                    key={item.label}
                    onClick={() => {
                      closeSidebar();
                      if (item.href.startsWith("#")) {
                        setActiveHash(item.href);
                      }
                    }}
                    className={isMenuLinkActive ? "active" : undefined}
                  >
                    <Icon size={20} />
                    {item.label}
                  </a>
                );
              })}
            </>
          )}
        </nav>

        {/* kartu monitor status alat iot */}
        <div className="sidebar__device-card">
          <span className={`status-dot ${getDotClass()}`} />
          <span className={getLabelClass()}>
            {getStatusLabel()}
          </span>
        </div>

        {/* menu profil dan logout langsung di paling bawah khusus admin */}
        {isAdmin && (
          <>
            <hr className="sidebar__divider" />

            <div className="sidebar__bottom-actions">
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="sidebar__action-btn"
              >
                <CircleUser size={20} />
                <span>Admin Profile</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="sidebar__action-btn sidebar__action-btn--danger"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </aside>
      {sidebarOpen && <button className="sidebar-overlay" aria-label="Tutup menu" onClick={closeSidebar} type="button" />}

      {/* modal informasi profil administrator */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CircleUser className="w-5 h-5 text-[#00247D]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Profil Administrator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label="Tutup modal profil"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Nama Akun</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {user?.name || "Administrator Desa"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Email Terdaftar</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {user?.email || "admin@cibenda.desa.id"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Peran & Akses</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {user?.roles?.[0] || "admin"} (Akses Penuh)
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Status Sesi</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif Terautentikasi
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};