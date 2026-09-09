import React from "react";
import { Plus, Pencil, Trash2, PhoneCall, Tag } from "lucide-react";
import type { EmergencyContactRecord } from "../../../../types/emergencyContact";
import { resolveContactIcon } from "../../utils/emergencyIconPresets";

interface AdditionalContactsSectionProps {
  contacts: EmergencyContactRecord[];
  isLoading?: boolean;
  onAddNew?: () => void;
  onEdit: (contact: EmergencyContactRecord) => void;
  onDelete: (contact: EmergencyContactRecord) => void;
}

export const AdditionalContactsSection: React.FC<AdditionalContactsSectionProps> = ({
  contacts,
  isLoading = false,
  onAddNew,
  onEdit,
  onDelete,
}) => {
  const additionalContacts = contacts.filter((c) => !c.isCore);

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Kontak Darurat Tambahan</span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {additionalContacts.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kontak pendukung lapangan, relawan desa, atau layanan darurat tambahan yang dapat disesuaikan.
          </p>
        </div>
      </div>

      {/* Grid Kontak Tambahan */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`add-skeleton-${idx}`}
              className="h-20 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl animate-pulse p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-md" />
            </div>
          ))}
        </div>
      ) : additionalContacts.length === 0 ? (
        // Empty State
        <div className="py-8 text-center text-slate-500 dark:text-slate-400">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2.5">
            <PhoneCall size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Belum Ada Kontak Tambahan
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Anda dapat menambahkan nomor relawan gawat darurat atau posko khusus desa di luar 6 kontak inti utama.
          </p>
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00247D] hover:bg-[#001d66] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Data Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          {additionalContacts.map((contact) => {
            const { Icon: ContactIcon, boxClass } = resolveContactIcon(
              contact.id,
              contact.institution,
              contact.icon ?? undefined
            );

            return (
              <div
                key={contact.id}
                className="bg-slate-50/60 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${boxClass}`}
                  >
                    <ContactIcon size={20} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                      {contact.institution}
                    </h4>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {contact.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Aksi & Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    <Tag size={10} />
                    TAMBAHAN
                  </span>

                  <button
                    type="button"
                    onClick={() => onEdit(contact)}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-[#00247D] dark:hover:text-blue-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Edit kontak"
                    aria-label={`Edit ${contact.institution}`}
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(contact)}
                    className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-800 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer"
                    title="Hapus kontak tambahan"
                    aria-label={`Hapus ${contact.institution}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
