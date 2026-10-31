import React from "react";
import { X, ShieldCheck, MapPin, EyeOff, Database, Server } from "lucide-react";

type PrivacyPolicyModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 id="privacy-modal-title" className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Kebijakan Privasi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                SIGAP Desa Cibenda, Kec. Parigi, Kab. Pangandaran
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup modal kebijakan privasi"
          >
            <X size={18} />
          </button>
        </div>

        {/* Konten Kebijakan */}
        <div className="px-5 py-4 overflow-y-auto space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <EyeOff size={16} className="text-[#00247D] dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-semibold mb-0.5">
                Bebas Registrasi Warga
              </strong>
              <span>
                Portal SIGAP dapat diakses secara publik oleh seluruh warga tanpa kewajiban mendaftar akun, mengisi identitas pribadi, atau menyerahkan NIK.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <MapPin size={16} className="text-[#00247D] dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-semibold mb-0.5">
                Privasi Lokasi GPS Lokal
              </strong>
              <span>
                Fitur deteksi lokasi pada peta evakuasi dihitung 100% di browser perangkat Anda. Koordinat GPS Anda tidak pernah dikirim, disimpan, atau dicatat di server desa.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <Database size={16} className="text-[#00247D] dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-semibold mb-0.5">
                Sumber Data Resmi & Kredibel
              </strong>
              <span>
                Seluruh data gempa bumi, potensi tsunami, dan prakiraan cuaca diperoleh langsung secara otomatis dari API resmi BMKG dan Open-Meteo.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <Server size={16} className="text-[#00247D] dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-semibold mb-0.5">
                Akses Terbatas Staf Desa
              </strong>
              <span>
                Pintu masuk login hanya diperuntukkan bagi petugas Posko dan Administrator Pemerintah Desa Cibenda untuk verifikasi status tanggap darurat resmi.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#00247D] hover:bg-[#001d66] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
