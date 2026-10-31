import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Volume2,
  Settings,
  Zap,
} from "lucide-react";
import { BiBarChartAlt } from "react-icons/bi";
import { FaSearchLocation } from "react-icons/fa";
import { FaExclamation } from "react-icons/fa6";
import { IoMdArrowDropright } from "react-icons/io";
import { LuBookOpenCheck, LuSiren } from "react-icons/lu";
import { MdContactPhone, MdOutlineManageAccounts } from "react-icons/md";
import { Card } from "../../../components/ui/Card";
import type { CurrentAlert } from "../../../types/dashboard";
import { useAuthStore } from "../../../stores/authStore";
import { cn } from "../../../utils/cn";

interface AdminQuickActionsPanelProps {
  alert: CurrentAlert | null;
  pendingCount?: number;
  onOpenVerify: () => void;
  onTriggerSiren: () => void;
}

export const AdminQuickActionsPanel: React.FC<AdminQuickActionsPanelProps> = ({
  alert,
  pendingCount = 0,
  onOpenVerify,
  onTriggerSiren,
}) => {
  const { isAdmin } = useAuthStore();

  const alertLevel = alert?.level || "GREEN";
  const isHighThreat = alertLevel === "ORANGE" || alertLevel === "RED";
  const isPendingReview =
    alert?.reviewStatus === "Belum Diverifikasi" ||
    alert?.reviewStatus === "Belum Ditinjau";

  const quickNavItems = [
    {
      label: "Verifikasi Gempa",
      desc: "Audit log & arsip alert",
      href: "/admin/alerts",
      icon: BiBarChartAlt,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      badge: pendingCount > 0 ? `${pendingCount} Review` : "Tabel Log",
      badgeClass: pendingCount > 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700",
    },
    {
      label: "Kontrol Sirine & IoT",
      desc: "Status Unit Posko & Toa",
      href: "/admin/sirine-iot",
      icon: LuSiren,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      badge: "Perangkat",
      badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    {
      label: "Kelola Titik Evakuasi",
      desc: "Peta shelter & rute aman",
      href: "/admin/titik-evakuasi",
      icon: FaSearchLocation,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      badge: "Shelter",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Kontak Darurat",
      desc: "Nomor darurat desa & BPBD",
      href: "/admin/kontak-darurat",
      icon: MdContactPhone,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      badge: "Kontak",
      badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    {
      label: "Panduan Kesiapsiagaan",
      desc: "Edukasi & materi mitigasi",
      href: "/admin/panduan-kesiapsiagaan",
      icon: LuBookOpenCheck,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      badge: "SOP Warga",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    ...(isAdmin
      ? [
          {
            label: "Manajemen Akun",
            desc: "Kelola akun & hak akses",
            href: "/admin/manajemen-akun",
            icon: MdOutlineManageAccounts,
            iconColor: "text-rose-600 dark:text-rose-400",
            iconBg: "bg-rose-500/10 border-rose-500/20",
            badge: "Admin",
            badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          },
        ]
      : []),
    {
      label: "Pengaturan Sistem",
      desc: "Konfigurasi portal SIGAP",
      href: "/admin/pengaturan-sistem",
      icon: Settings,
      iconColor: "text-slate-500",
      iconBg: "bg-slate-500/10 border-slate-500/20",
      badge: "Konfigurasi",
      badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700",
    },
  ];

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xs">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--border)] pb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs">
            <Zap size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-[color:var(--text)] truncate">
              Panel Akses Cepat Admin
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[color:var(--text-muted)] font-medium truncate">
              Pintasan modul navigasi & kendali posko
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] border border-[color:var(--border)] whitespace-nowrap">
          Klik Cepat
        </span>
      </div>

      {/* 2 Tombol Aksi Kritis Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Tombol 1: Verifikasi Alert Cepat */}
        <button
          type="button"
          onClick={onOpenVerify}
          className={cn(
            "flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 active:translate-y-0 group",
            isPendingReview
              ? "border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-500"
              : "border-[color:var(--border)] bg-[color:var(--surface-muted)] hover:border-slate-300 dark:hover:border-slate-700"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[color:var(--text)] truncate">
                Verifikasi Alert
              </p>
              <p className="text-[10px] text-[color:var(--text-muted)] truncate">
                {isPendingReview ? "Perlu Review Staf" : "Data Tervalidasi"}
              </p>
            </div>
          </div>
          {/* Ikon Exclamation goyang atas-bawah terus menerus tanpa background bulat */}
          <FaExclamation className="text-amber-500 dark:text-amber-400 text-sm sm:text-base animate-bounce shrink-0" />
        </button>

        {/* Tombol 2: Trigger Sirine Menara (FS-09) */}
        <button
          type="button"
          onClick={onTriggerSiren}
          disabled={!isHighThreat}
          className={cn(
            "flex items-center justify-between p-3 rounded-xl border text-left transition-all shadow-2xs",
            isHighThreat
              ? "border-rose-500 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              : "border-[color:var(--border)] bg-slate-100/60 dark:bg-slate-800/40 text-[color:var(--text-muted)] cursor-not-allowed opacity-75"
          )}
          title={
            isHighThreat
              ? "Picu Sirine Menara Desa (Konfirmasi 2 lapis)"
              : "Pemicu sirine terkunci saat level GREEN/YELLOW (FS-09)"
          }
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                isHighThreat
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600"
              )}
            >
              {isHighThreat ? (
                <Volume2 size={16} className="animate-pulse" />
              ) : (
                <Lock size={15} />
              )}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-xs font-bold truncate",
                  isHighThreat ? "text-white" : "text-[color:var(--text)]"
                )}
              >
                {isHighThreat ? "Pemicu Sirine" : "Sirine Terkunci"}
              </p>
              <p
                className={cn(
                  "text-[10px] truncate",
                  isHighThreat ? "text-rose-100" : "text-[color:var(--text-muted)]"
                )}
              >
                {isHighThreat ? "Level ORANGE/RED" : "Standby Desa"}
              </p>
            </div>
          </div>
          {isHighThreat && (
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white text-rose-700 shadow-2xs shrink-0">
              Picu
            </span>
          )}
        </button>
      </div>

      {/* Grid Pintasan Modul Cepat (Sesuai Ikon Sidebar) */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[color:var(--text-muted)]">
          Pintasan Modul Admin
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickNavItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.href}
                className="group flex items-center justify-between p-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-muted)] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 shadow-2xs hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-2xs", item.iconBg, item.iconColor)}>
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[color:var(--text)] truncate group-hover:text-[color:var(--primary)] transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-[color:var(--text-muted)] truncate">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1.5">
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0",
                      item.badgeClass
                    )}
                  >
                    {item.badge}
                  </span>
                  <IoMdArrowDropright className="text-[color:var(--text-muted)] group-hover:text-[color:var(--primary)] group-hover:translate-x-0.5 transition-all text-sm shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

