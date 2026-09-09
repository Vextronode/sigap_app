import React, { useState, useEffect } from "react";
import { X, PhoneCall, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import type { EmergencyContactRecord } from "../../../../types/emergencyContact";
import { IconPicker } from "./IconPicker";
import {
  resolveContactIcon,
  detectDefaultIconKey,
  type EmergencyIconKey,
} from "../../utils/emergencyIconPresets";

interface EmergencyContactFormModalProps {
  isOpen: boolean;
  contact: EmergencyContactRecord | null;
  onClose: () => void;
  onSubmit: (data: {
    institution: string;
    phoneNumber: string;
    iconKey: EmergencyIconKey;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const EmergencyContactFormModal: React.FC<EmergencyContactFormModalProps> = ({
  isOpen,
  contact,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [institution, setInstitution] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<EmergencyIconKey>("phone");
  const [hasManualIconSelection, setHasManualIconSelection] = useState(false);
  const [errors, setErrors] = useState<{ institution?: string; phoneNumber?: string }>({});

  const isEdit = !!contact;

  useEffect(() => {
    if (contact) {
      setInstitution(contact.institution);
      setPhoneNumber(contact.phoneNumber);
      const currentPreset = resolveContactIcon(
        contact.id,
        contact.institution,
        contact.icon ?? undefined
      );
      setSelectedIcon(currentPreset.key);
      setHasManualIconSelection(true);
    } else {
      setInstitution("");
      setPhoneNumber("");
      setSelectedIcon("phone");
      setHasManualIconSelection(false);
    }
    setErrors({});
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { institution?: string; phoneNumber?: string } = {};
    if (!institution.trim()) {
      newErrors.institution = "Nama institusi wajib diisi.";
    } else if (institution.trim().length < 2) {
      newErrors.institution = "Nama institusi minimal 2 karakter.";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Nomor telepon wajib diisi.";
    } else if (phoneNumber.trim().length < 3) {
      newErrors.phoneNumber = "Nomor telepon minimal 3 karakter.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        institution: institution.trim(),
        phoneNumber: phoneNumber.trim(),
        iconKey: selectedIcon,
      });
      onClose();
    } catch {
      // Error ditangani oleh parent component
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-left">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 flex items-center justify-center">
              <PhoneCall size={20} />
            </div>
            <div>
              <h3
                id="modal-title"
                className="font-bold text-slate-900 dark:text-white text-base sm:text-lg"
              >
                {isEdit ? "Perbarui Kontak Darurat" : "Tambah Kontak Darurat Baru"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEdit
                  ? `Mengubah rincian kontak untuk ${contact.institution}`
                  : "Tambahkan data instansi atau layanan darurat ke sistem"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer transition-colors"
            aria-label="Tutup form"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Notice */}
        <div className="mt-4">
          {isEdit && contact.isCore ? (
            <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <ShieldCheck size={16} className="text-[#00247D] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-[#00247D] dark:text-blue-300">
                  Kontak Darurat Inti Desa
                </span>
                Anda dapat memperbarui nama, nomor, atau icon institusi ini. Entri ini dilindungi sistem dan tidak dapat dihapus.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <AlertCircle size={15} className="text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
              <span>
                Kontak yang ditambahkan berstatus <strong>Kontak Tambahan</strong> dan dapat diedit atau dihapus sesuai kebutuhan lapangan.
              </span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Input Institusi */}
          <div>
            <label
              htmlFor="institution-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
            >
              Nama Institusi / Layanan <span className="text-rose-500">*</span>
            </label>
            <input
              id="institution-input"
              type="text"
              value={institution}
              onChange={(e) => {
                const val = e.target.value;
                setInstitution(val);
                if (!hasManualIconSelection && !isEdit) {
                  setSelectedIcon(detectDefaultIconKey(val));
                }
                if (errors.institution) setErrors((prev) => ({ ...prev, institution: undefined }));
              }}
              placeholder="Contoh: Polsek Parigi, Puskesmas Parigi, SAR Pangandaran"
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00247D]/20 focus:border-[#00247D] dark:text-white placeholder-slate-400 transition-colors ${
                errors.institution
                  ? "border-rose-300 dark:border-rose-700 bg-rose-50/30"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            />
            {errors.institution && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                {errors.institution}
              </p>
            )}
          </div>

          {/* Input Nomor Telepon */}
          <div>
            <label
              htmlFor="phone-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
            >
              Nomor Telepon Darurat <span className="text-rose-500">*</span>
            </label>
            <input
              id="phone-input"
              type="text"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
              }}
              placeholder="Contoh: 119, 0265-639110, 0812-2345-6789"
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-800/80 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00247D]/20 focus:border-[#00247D] dark:text-white placeholder-slate-400 transition-colors ${
                errors.phoneNumber
                  ? "border-rose-300 dark:border-rose-700 bg-rose-50/30"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Selector Icon Kedaruratan */}
          <div className="pt-1">
            <IconPicker
              selectedKey={selectedIcon}
              onChange={(key) => {
                setSelectedIcon(key);
                setHasManualIconSelection(true);
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#00247D] hover:bg-[#001d66] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              <span>{isEdit ? "Simpan Perubahan" : "Simpan Data"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
