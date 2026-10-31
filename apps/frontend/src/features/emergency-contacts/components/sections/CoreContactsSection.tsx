import React from "react";
import type { EmergencyContactRecord } from "../../../../types/emergencyContact";
import { CoreContactCard } from "../cards/CoreContactCard";

interface CoreContactsSectionProps {
  contacts: EmergencyContactRecord[];
  isLoading?: boolean;
  onEdit: (contact: EmergencyContactRecord) => void;
}

export const CoreContactsSection: React.FC<CoreContactsSectionProps> = ({
  contacts,
  isLoading = false,
  onEdit,
}) => {
  const coreContacts = contacts.filter((c) => c.isCore);

  return (
    <section className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs">
      {/* Header Direktori Sesuai Screenshot */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Direktori Kontak Darurat Inti
        </h2>

        <span className="shrink-0 bg-[#E0EDFF] dark:bg-blue-950/80 text-[#00247D] dark:text-blue-300 text-xs font-semibold px-3.5 py-1 rounded-full border border-blue-200/60 dark:border-blue-900/40">
          {isLoading ? "Memuat..." : `${coreContacts.length} Kontak Terdaftar`}
        </span>
      </div>

      {/* Grid 2 Kolom Kartu Kontak Inti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`core-skeleton-${idx}`}
                className="h-20 bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl animate-pulse p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                  </div>
                </div>
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
            ))
          : coreContacts.map((contact) => (
              <CoreContactCard
                key={contact.id}
                contact={contact}
                onEdit={onEdit}
              />
            ))}
      </div>
    </section>
  );
};
