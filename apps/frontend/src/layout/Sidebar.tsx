import { useEffect, useState } from "react";
import {
  BookOpen,
  CircleUser,
  Cloud,
  Contact,
  Home,
  LayoutDashboard,
  LogOut,
  // Megaphone,
  Radio,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { BiBarChartAlt, BiCurrentLocation } from "react-icons/bi";
import { FaSearchLocation } from "react-icons/fa";
import { GrMapLocation, GrUserAdmin } from "react-icons/gr";
import { IoMdArrowDropdown } from "react-icons/io";
import { LuBookOpenCheck, LuSiren } from "react-icons/lu";
import { MdContactPhone, MdOutlineManageAccounts } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUiStore } from "../stores/uiStore";
import { useAuthStore } from "../stores/authStore";
import { useDeviceStatus } from "../features/dashboard/hooks/useDeviceStatus";
import { Badge } from "../components/ui/Badge";
import { ProfileModal } from "./components/ProfileModal";

// daftar tautan publik warga desa
const sectionLinks = [
  { label: "Peta Gempa", href: "#earthquake-map", icon: BiCurrentLocation },
  { label: "Cuaca", href: "#weather", icon: Cloud },
  { label: "Gempa / Tsunami", href: "#earthquake", icon: Radio },
  { label: "Jalur Evakuasi", href: "#evacuation", icon: GrMapLocation },
  { label: "Kontak Darurat", href: "#contacts", icon: Contact },
  { label: "Panduan", href: "#preparedness", icon: BookOpen },
  // { label: "Pengumuman", href: "#announcements", icon: Megaphone }, // Dinonaktifkan sementara
];

// daftar tautan utilitas khusus admin dalam bahasa indonesia
const adminLinks = [
  { label: "Dashboard Admin", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Verifikasi Gempa", href: "/admin/alerts", icon: BiBarChartAlt },
  { label: "Kontak Darurat", href: "/admin/kontak-darurat", icon: MdContactPhone },
  { label: "Kelola Titik Evakuasi", href: "/admin/titik-evakuasi", icon: FaSearchLocation },
  { label: "Panduan Kesiapsiagaan", href: "/admin/panduan-kesiapsiagaan", icon: LuBookOpenCheck },
  { label: "Kontrol Sirine & IoT", href: "/admin/sirine-iot", icon: LuSiren },
  { label: "Manajemen Akun", href: "/admin/manajemen-akun", icon: MdOutlineManageAccounts, adminOnly: true },
  { label: "Pengaturan Sistem", href: "/admin/pengaturan-sistem", icon: Settings },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const { data: deviceStatus, isLoading: isDeviceLoading, isError: isDeviceError } = useDeviceStatus();

  // state autentikasi admin dan modal profil
  const { isAdmin, user, logout } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Peran role pengguna saat ini
  const isOperator = user?.roles?.some((r) => r.toLowerCase().includes("operator")) ?? false;
  const isAdminRole = !isOperator;
  const roleLabel = isOperator ? "OPERATOR" : "ADMIN";

  // state collapse menu warga khusus di tampilan admin (tersimpan di localStorage)
  const [isCitizenNavCollapsed, setIsCitizenNavCollapsed] = useState(() => {
    return localStorage.getItem("sigap_admin_warga_collapsed") === "true";
  });

  const toggleCitizenNav = () => {
    setIsCitizenNavCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sigap_admin_warga_collapsed", String(next));
      return next;
    });
  };

  // state collapse menu admin di tampilan admin (tersimpan di localStorage)
  const [isAdminNavCollapsed, setIsAdminNavCollapsed] = useState(() => {
    return localStorage.getItem("sigap_admin_menu_collapsed") === "true";
  });

  const toggleAdminNav = () => {
    setIsAdminNavCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sigap_admin_menu_collapsed", String(next));
      return next;
    });
  };

  // tampilkan menu admin jika role admin atau sedang di rute /admin/*
  const showAdminNav = isAdmin || location.pathname.startsWith("/admin");

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
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""} ${showAdminNav ? "sidebar--admin" : "sidebar--citizen"} overflow-y-auto`} aria-label="Navigasi utama">
        {/* Komponen Logo */}
        <div className="sidebar__brand flex items-center px-1.5 pt-2 pb-3 relative justify-between">
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
              <strong className="text-gray-900 dark:text-white font-bold text-lg">
                SIGAP
              </strong>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Desa Cibenda
              </span>
            </div>
          </div>
          <button className="sidebar__close" type="button" onClick={closeSidebar} aria-label="Tutup menu">
            <X size={22} />
          </button>
        </div>

        {/* Tag Status Peran di bawah komponen logo (bukan di dalam logo) */}
        {showAdminNav && (
          <div className="px-2 pt-1 pb-3 flex items-center">
            <Badge
              tone="neutral"
              className={
                isOperator
                  ? "!bg-blue-100 !text-[#00247D] dark:!bg-blue-950/70 dark:!text-blue-300"
                  : "!bg-rose-100 !text-rose-700 dark:!bg-rose-950/70 dark:!text-rose-300"
              }
            >
              {`STATUS: ${roleLabel}`}
            </Badge>
          </div>
        )}

        <nav className="sidebar__nav">
          {/* Header Seksi WARGA (khusus tampilan admin) dengan tombol dropdown collapse & warna biru SIGAP */}
          {showAdminNav && (
            <div className="pt-1.5 pb-1.5 px-2 flex items-center gap-2 select-none">
              <button
                type="button"
                onClick={toggleCitizenNav}
                className="group flex items-center gap-1.5 px-1.5 py-0.5 -ml-1 rounded-md text-[color:var(--primary)] hover:bg-blue-50/70 dark:hover:bg-blue-950/30 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-expanded={!isCitizenNavCollapsed}
                aria-label={isCitizenNavCollapsed ? "Buka menu navigasi warga" : "Tutup menu navigasi warga"}
                title={isCitizenNavCollapsed ? "Buka menu warga" : "Tutup menu warga"}
              >
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[color:var(--primary)]">
                  WARGA
                </span>
                <IoMdArrowDropdown
                  size={22}
                  className={`text-[color:var(--primary)] opacity-80 group-hover:opacity-100 transition-transform duration-200 ${
                    isCitizenNavCollapsed ? "-rotate-90" : "rotate-0"
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div className="h-px flex-1 bg-[color:var(--border)]" />
            </div>
          )}

          {(() => {
            // Sembunyikan tautan menu warga jika sedang di-collapse oleh admin
            if (showAdminNav && isCitizenNavCollapsed) {
              return null;
            }

            const isCitizenPage = location.pathname === "/" || location.pathname === "/dashboard";
            const citizenIconSize = showAdminNav ? 20 : 22;
            return (
              <>
                <Link 
                  to="/?view=warga" 
                  onClick={handleDashboardClick} 
                  className={isCitizenPage && (activeHash === "" || activeHash === "#") ? "active" : undefined}
                >
                  <Home size={citizenIconSize} />
                  Dashboard Warga
                </Link>

                {sectionLinks.map((item) => {
                  const Icon = item.icon;
                  const isMenuLinkActive = isCitizenPage && activeHash === item.href;
                  const targetHref = `/?view=warga${item.href}`;
                  
                  return (
                    <a 
                      href={targetHref} 
                      key={item.label} 
                      onClick={(e) => {
                        closeSidebar();
                        if (isCitizenPage) {
                          e.preventDefault();
                          setActiveHash(item.href);
                          const targetEl = document.querySelector(item.href);
                          if (targetEl) {
                            targetEl.scrollIntoView({ behavior: "smooth" });
                          }
                          window.history.replaceState(null, "", targetHref);
                        }
                      }}
                      className={isMenuLinkActive ? "active" : undefined}
                    >
                      <Icon size={citizenIconSize} />
                      {item.label}
                    </a>
                  );
                })}
              </>
            );
          })()}

          {/* section menu khusus admin dengan tombol dropdown collapse & warna biru SIGAP */}
          {showAdminNav && (
            <>
              <div className="mt-2.5 mb-0 px-2 flex items-center gap-2 select-none">
                <button
                  type="button"
                  onClick={toggleAdminNav}
                  className="group flex items-center gap-1.5 px-1.5 py-0.5 -ml-1 rounded-md text-[color:var(--primary)] hover:bg-blue-50/70 dark:hover:bg-blue-950/30 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-expanded={!isAdminNavCollapsed}
                  aria-label={isAdminNavCollapsed ? "Buka menu navigasi admin" : "Tutup menu navigasi admin"}
                  title={isAdminNavCollapsed ? "Buka menu admin" : "Tutup menu admin"}
                >
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-[color:var(--primary)]">
                    ADMIN
                  </span>
                  <IoMdArrowDropdown
                    size={22}
                    className={`text-[color:var(--primary)] opacity-80 group-hover:opacity-100 transition-transform duration-200 ${
                      isAdminNavCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div className="h-px flex-1 bg-[color:var(--border)]" />
              </div>

              {!isAdminNavCollapsed &&
                adminLinks
                  .filter((item) => !item.adminOnly || (user?.roles?.includes("admin") ?? false))
                  .map((item) => {
                  const Icon = item.icon;
                  const isRouterLink = item.href.startsWith("/");
                  const isMenuLinkActive = isRouterLink
                    ? location.pathname === item.href
                    : activeHash === item.href;

                  if (isRouterLink) {
                    return (
                      <Link
                        to={item.href}
                        key={item.label}
                        onClick={() => {
                          closeSidebar();
                          setActiveHash("");
                        }}
                        className={isMenuLinkActive ? "active" : undefined}
                      >
                        <Icon size={20} />
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <a
                      href={item.href}
                      key={item.label}
                      onClick={() => {
                        closeSidebar();
                        setActiveHash(item.href);
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

        {/* tautan login staf desa di bagian bawah khusus mode warga */}
        {!showAdminNav && (
          <div className="mt-auto pt-4 pb-2 px-1">
            <hr className="sidebar__divider !my-3" />
            <Link
              to="/admin/login"
              onClick={closeSidebar}
              className="sidebar__staff-btn"
              title="Portal Khusus Petugas & Admin SIGAP"
            >
              <div className="sidebar__staff-btn-icon">
                <ShieldCheck size={18} />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-[0.88rem] tracking-tight">
                  Akses Petugas Desa
                </span>
                <span className="text-[11px] opacity-75 font-medium mt-0.5">
                  Login Admin & Operator
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* kartu monitor status alat iot (khusus admin) */}
        {showAdminNav && (
          <div className="sidebar__device-card">
            <span className={`status-dot ${getDotClass()}`} />
            <span className={getLabelClass()}>
              {getStatusLabel()}
            </span>
          </div>
        )}

        {/* menu profil dan logout langsung di paling bawah khusus admin */}
        {showAdminNav && (
          <>
            <hr className="sidebar__divider" />

            <div className="sidebar__bottom-actions">
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="sidebar__action-btn"
              >
                {isAdminRole ? (
                  <GrUserAdmin size={18} className="shrink-0" />
                ) : (
                  <CircleUser size={20} className="shrink-0" />
                )}
                <span>{isAdminRole ? "Administrator Profile" : "Operator Profile"}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className={`w-full mt-2 min-h-[38px] px-3.5 py-2 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs tracking-wide transition-all shadow-xs cursor-pointer ${
                  isAdminRole
                    ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white"
                    : "bg-[#00247D] hover:bg-[#001d66] active:bg-[#00174f] text-white"
                }`}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </aside>
      {sidebarOpen && <button className="sidebar-overlay" aria-label="Tutup menu" onClick={closeSidebar} type="button" />}

      {/* modal informasi profil dan manajemen password */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};