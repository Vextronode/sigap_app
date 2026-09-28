import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  CircleUser,
  Cloud,
  CloudRain,
  Contact,
  Home,
  LayoutDashboard,
  LogOut,
  Map,
  Megaphone,
  Radio,
  Settings,
  X,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BiBarChartAlt } from "react-icons/bi";
import { GrUserAdmin } from "react-icons/gr";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdOutlineManageAccounts } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUiStore } from "../stores/uiStore";
import { useAuthStore } from "../stores/authStore";
import { useDeviceStatus } from "../features/dashboard/hooks/useDeviceStatus";
import { authService } from "../services/authService";
import { Badge } from "../components/ui/Badge";
import axios from "axios";

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
  { label: "Verifikasi Gempa", href: "/admin/alerts", icon: BiBarChartAlt },
  { label: "Monitoring Cuaca", href: "#weather", icon: CloudRain },
  { label: "Aktivitas Seismik", href: "#earthquake", icon: Activity },
  { label: "Kontrol Sirine & IoT", href: "/admin/sirine-iot", icon: Bell },
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

  // state form ganti password mandiri
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwError(null);
    setPwSuccess(null);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!currentPassword.trim()) {
      setPwError("Password saat ini wajib diisi.");
      return;
    }

    if (!newPassword.trim()) {
      setPwError("Password baru wajib diisi.");
      return;
    }

    if (!confirmPassword.trim()) {
      setPwError("Konfirmasi password baru wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Konfirmasi password baru tidak sama.");
      return;
    }

    if (newPassword.length < 8) {
      setPwError("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword === currentPassword) {
      setPwError("Password baru tidak boleh sama dengan password saat ini.");
      return;
    }

    try {
      setPwLoading(true);
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      setPwSuccess("Password akun Anda berhasil diperbarui!");
      resetPasswordForm();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const resp = err.response?.data;
        const msg = resp?.message || (Array.isArray(resp?.errors) ? resp.errors[0] : null);
        setPwError(msg || "Gagal mengubah password.");
      } else if (err instanceof Error) {
        setPwError(err.message);
      } else {
        setPwError("Terjadi kesalahan pada server saat mengubah password.");
      }
    } finally {
      setPwLoading(false);
    }
  };

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
                  const targetHref = isCitizenPage ? item.href : `/?view=warga${item.href}`;
                  
                  return (
                    <a 
                      href={targetHref} 
                      key={item.label} 
                      onClick={() => {
                        closeSidebar();
                        if (isCitizenPage) {
                          setActiveHash(item.href);
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
                onClick={() => {
                  setShowProfileModal(true);
                  setShowChangePassword(false);
                  resetPasswordForm();
                }}
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
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {isAdminRole ? (
                  <GrUserAdmin className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                ) : (
                  <CircleUser className="w-5 h-5 text-[#00247D] dark:text-blue-400 shrink-0" />
                )}
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isAdminRole ? "Profil Administrator" : "Profil Petugas Lapangan"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  setShowChangePassword(false);
                  resetPasswordForm();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label="Tutup modal profil"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Information */}
            <div className="py-4 space-y-3.5 text-sm text-left">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block">Nama Akun</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  {(() => {
                    const raw = user?.name;
                    if (!raw || raw.trim() === "" || raw === "Admin Placeholder") {
                      return isAdminRole ? "Administrator" : "Petugas Lapangan";
                    }
                    return raw;
                  })()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block">Email Terdaftar</span>
                <span className="font-medium text-slate-800 dark:text-slate-100 text-sm">
                  {user?.email || (isAdminRole ? "admin@cibenda.desa.id" : "operator@cibenda.desa.id")}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mb-0.5">Peran & Akses</span>
                {isAdminRole ? (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-xs">
                    Administrator (Akses Penuh)
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs">
                    Petugas Lapangan (Operasional)
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mb-0.5">Status Sesi</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif Terautentikasi
                </span>
              </div>
            </div>

            {/* Section Ganti Password Mandiri */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(!showChangePassword);
                  setPwError(null);
                  setPwSuccess(null);
                }}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-700/60 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 text-amber-950 dark:text-amber-200 text-xs font-semibold shadow-xs shadow-amber-200/50 dark:shadow-none transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <KeyRound size={15} className="text-amber-500 shrink-0" />
                  <span>Ubah Kata Sandi Akun</span>
                </div>
                {showChangePassword ? (
                  <ChevronUp size={16} className="text-amber-600 dark:text-amber-400" />
                ) : (
                  <ChevronDown size={16} className="text-amber-600 dark:text-amber-400" />
                )}
              </button>

              {showChangePassword && (
                <form onSubmit={handleChangePasswordSubmit} className="mt-3 space-y-3 text-left">
                  {pwSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                      <span>{pwSuccess}</span>
                    </div>
                  )}

                  {pwError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-rose-600" />
                      <span>{pwError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Password Saat Ini
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-9 pl-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00247D] focus:ring-1 focus:ring-[#00247D]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Password Baru (Min. 8 karakter)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-9 pl-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00247D] focus:ring-1 focus:ring-[#00247D]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-9 pl-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00247D] focus:ring-1 focus:ring-[#00247D]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="w-full py-2 bg-[#00247D] hover:bg-[#001c61] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {pwLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <span>Simpan Password Baru</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  setShowChangePassword(false);
                  resetPasswordForm();
                }}
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