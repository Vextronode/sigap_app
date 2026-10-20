import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  Check,
  ArrowRight,
  ArrowLeft,
  Volume2,
  MapPin,
  Clock,
  UserCheck,
  User,
} from "lucide-react";
import { GrUserAdmin } from "react-icons/gr";
import type { AlertItem } from "../../../types/alert";
import type { CurrentAlert, Earthquake } from "../../../types/dashboard";
import { useAuthStore } from "../../../stores/authStore";
import { cn } from "../../../utils/cn";

interface DoubleConfirmationModalProps {
  isOpen: boolean;
  alert: AlertItem | CurrentAlert | null;
  earthquake?: Earthquake | null;
  onClose: () => void;
  onSubmit: (
    id: string,
    status: "Dikonfirmasi" | "Ditolak" | "Ditindaklanjuti",
    options?: { triggerSiren?: boolean }
  ) => Promise<void>;
  isSubmitting?: boolean;
}

type ReviewChoice = "Dikonfirmasi" | "Ditindaklanjuti" | "Ditolak";

export const DoubleConfirmationModal: React.FC<DoubleConfirmationModalProps> = ({
  isOpen,
  alert,
  earthquake,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const { user } = useAuthStore();
  const isOperator = user?.roles?.some((r) => r.toLowerCase().includes("operator")) ?? false;
  const isAdminRole = !isOperator;
  const roleLabel = isOperator ? "OPERATOR POSKO" : "ADMINISTRATOR";

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedStatus, setSelectedStatus] = useState<ReviewChoice>("Dikonfirmasi");
  const [triggerSiren, setTriggerSiren] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !alert) return null;

  const alertId = alert.id || "current-alert";
  const level = alert.level || "GREEN";
  const isHighDanger = level === "RED" || level === "ORANGE";
  const reviewerName = user?.name || user?.email || (isAdminRole ? "Administrator" : "Operator Posko");

  const handleNextToStep2 = () => {
    setErrorMsg(null);
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setErrorMsg(null);
    setStep(1);
  };

  const handleFinalSubmit = async () => {
    try {
      setErrorMsg(null);
      await onSubmit(alertId, selectedStatus, { triggerSiren });
      handleClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan konfirmasi alert resmi."
      );
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedStatus("Dikonfirmasi");
    setTriggerSiren(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="double-confirmation-title"
    >
      <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-[color:var(--border)] flex items-center justify-between bg-[color:var(--surface-muted)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                Langkah {step} dari 2
              </span>
              <h2
                id="double-confirmation-title"
                className="text-base font-bold text-[color:var(--text)]"
              >
                {step === 1 ? "Verifikasi & Klasifikasi Gempa" : "Konfirmasi Tindakan Resmi"}
              </h2>
            </div>
            <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
              Protokol Resmi Komando Kebencanaan Desa Cibenda
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 text-[color:var(--text-muted)] hover:text-[color:var(--text)] rounded-lg hover:bg-[color:var(--surface)] transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5 bg-[color:var(--surface)]">
          {errorMsg && (
            <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {/* Ringkasan Parameter Gempa */}
              <div className="p-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
                        level === "RED"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          : level === "ORANGE"
                            ? "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30"
                            : level === "YELLOW"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      )}
                    >
                      LEVEL {level}
                    </span>
                    <span className="text-xs text-[color:var(--text-muted)] flex items-center gap-1 font-mono">
                      <Clock size={12} />
                      {alert.updatedAt ? new Date(alert.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB" : "-"}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[color:var(--text-muted)]">
                    Sumber: {alert.source || "BMKG"}
                  </span>
                </div>

                {earthquake ? (
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-[color:var(--border)] text-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Magnitudo</p>
                      <p className="text-lg font-black text-[color:var(--primary)]">M {earthquake.magnitude}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Kedalaman</p>
                      <p className="text-sm font-bold text-[color:var(--text)] mt-1">{earthquake.depth}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Jarak ke Desa</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">{earthquake.distanceToVillage} km</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 border-y border-[color:var(--border)]">
                    <p className="text-xs text-[color:var(--text-muted)]">
                      {alert.description || "Parameter seismik sedang disinkronkan dari BMKG TEWS."}
                    </p>
                  </div>
                )}

                {alert.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[color:var(--text)] font-semibold">
                    <MapPin size={13} className="text-rose-500 shrink-0" />
                    <span className="truncate">{alert.location}</span>
                  </div>
                )}
              </div>

              {/* Pilihan Tindakan Klasifikasi */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Pilih Klasifikasi Keputusan:
                </label>

                {/* Opsi 1: Dikonfirmasi */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus("Dikonfirmasi")}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                    selectedStatus === "Dikonfirmasi"
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20"
                      : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0",
                      selectedStatus === "Dikonfirmasi"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-[color:var(--border)]"
                    )}
                  >
                    {selectedStatus === "Dikonfirmasi" && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span className="text-sm font-bold text-[color:var(--text)]">Konfirmasi Gempa Resmi</span>
                    </div>
                    <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
                      Validasi data BMKG sebagai insiden nyata. Mencatat status verifikasi staf di buku besar desa.
                    </p>
                  </div>
                </button>

                {/* Opsi 2: Ditindaklanjuti */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus("Ditindaklanjuti")}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                    selectedStatus === "Ditindaklanjuti"
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100 ring-2 ring-amber-500/20"
                      : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0",
                      selectedStatus === "Ditindaklanjuti"
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-[color:var(--border)]"
                    )}
                  >
                    {selectedStatus === "Ditindaklanjuti" && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={16} className="text-amber-600" />
                      <span className="text-sm font-bold text-[color:var(--text)]">Ditindaklanjuti (Eskalasi Posko)</span>
                    </div>
                    <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
                      Gempa signifikan membutuhkan koordinasi relawan RT/RW, pengecekan pesisir pantai, atau kontak BPBD.
                    </p>
                  </div>
                </button>

                {/* Opsi 3: Ditolak */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus("Ditolak")}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                    selectedStatus === "Ditolak"
                      ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20"
                      : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0",
                      selectedStatus === "Ditolak"
                        ? "border-rose-600 bg-rose-600 text-white"
                        : "border-[color:var(--border)]"
                    )}
                  >
                    {selectedStatus === "Ditolak" && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert size={16} className="text-rose-600" />
                      <span className="text-sm font-bold text-[color:var(--text)]">Tolak / False Alarm</span>
                    </div>
                    <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
                      Tandai sebagai anomali sensor BMKG atau gempa di luar radius bahaya Pangandaran. Status siaga warga akan dinormalkan ke Aman (GREEN).
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Lapis 2: Safety Warning */}
              <div
                className={cn(
                  "p-4 rounded-xl border space-y-3",
                  selectedStatus === "Ditolak"
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200"
                    : selectedStatus === "Ditindaklanjuti"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <UserCheck size={20} className="mt-0.5 shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Konfirmasi Akhir & Audit Akuntabilitas
                    </p>
                    <p className="text-sm font-semibold leading-relaxed">
                      Anda akan menandai alert ini sebagai:{" "}
                      <span className="underline uppercase tracking-wide">
                        "{selectedStatus}"
                      </span>
                    </p>
                    <div className="flex items-center gap-2 pt-2 border-t border-current/15">
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md shrink-0 text-xs",
                          isAdminRole
                            ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                            : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {isAdminRole ? <GrUserAdmin className="w-3.5 h-3.5" /> : <User size={13} />}
                      </div>
                      <div className="text-xs min-w-0 truncate">
                        <span className="opacity-80">Diverifikasi oleh:</span>{" "}
                        <strong className="font-bold">{reviewerName}</strong>
                        <span
                          className={cn(
                            "text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ml-1.5",
                            isAdminRole
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                              : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                          )}
                        >
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opsi Sirine Remote (FS-09) jika Level ORANGE / RED dan status konfirmasi */}
              {isHighDanger && selectedStatus !== "Ditolak" && (
                <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 space-y-3">
                  <div className="flex items-start gap-3">
                    <Volume2 size={20} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
                        Pemicu Sirine Remote Jarak Jauh (FS-09)
                      </p>
                      <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">
                        Level ancaman saat ini adalah <strong>{level}</strong>. Anda dapat sekaligus mengirimkan perintah pemicu ke Sirine Menara Desa (Alat 2).
                      </p>

                      <label className="mt-3 flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={triggerSiren}
                          onChange={(e) => setTriggerSiren(e.target.checked)}
                          className="h-4 w-4 rounded border-red-400 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-red-900 dark:text-red-100">
                          BUNYIKAN SIRINE MENARA DESA (REMOTE TRIGGER)
                        </span>
                      </label>
                      <p className="text-[10px] text-red-700/80 dark:text-red-300/80 pl-6">
                        *Perintah dititipkan ke Unit Utama posko dalam polling berikutnya (≤15 detik).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedStatus === "Ditolak" && (
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-[color:var(--border)] text-xs text-[color:var(--text-muted)] space-y-1">
                  <p className="font-semibold text-[color:var(--text)]">Konsekuensi Penolakan:</p>
                  <p>
                    Status darurat warga akan langsung diturunkan ke level <strong>GREEN (Aman)</strong>. Arsip tetap disimpan di tabel audit log verifikasi.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[color:var(--border)] flex items-center justify-between bg-[color:var(--surface-muted)]">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[color:var(--border)] hover:bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:text-[color:var(--text)] transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleNextToStep2}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[color:var(--primary)] text-white hover:opacity-90 shadow-xs transition-all cursor-pointer"
              >
                <span>Lanjut ke Konfirmasi</span>
                <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBackToStep1}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-[color:var(--border)] hover:bg-[color:var(--surface)] text-[color:var(--text)] transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-white shadow-xs transition-all cursor-pointer",
                  selectedStatus === "Ditolak"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : selectedStatus === "Ditindaklanjuti"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-emerald-600 hover:bg-emerald-700",
                  isSubmitting && "opacity-75 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Menyimpan Keputusan...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    <span>Eksekusi Keputusan Resmi</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
