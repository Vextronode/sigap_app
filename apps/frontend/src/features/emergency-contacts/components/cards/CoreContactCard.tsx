import React from "react";
import { Lock } from "lucide-react";
import type { EmergencyContactRecord } from "../../../../types/emergencyContact";
import { resolveContactIcon } from "../../utils/emergencyIconPresets";

interface CoreContactCardProps {
  contact: EmergencyContactRecord;
  onEdit: (contact: EmergencyContactRecord) => void;
}

export const CoreContactCard: React.FC<CoreContactCardProps> = ({
  contact,
  onEdit,
}) => {
  const { Icon, boxClass } = resolveContactIcon(
    contact.id,
    contact.institution,
    contact.icon ?? undefined
  );

  return (
    <div
      onClick={() => onEdit(contact)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(contact);
        }
      }}
      className="group bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl sm:rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
      title={`Klik untuk mengedit data kontak ${contact.institution}`}
    >
      {/* Icon + Nama & Nomor */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${boxClass}`}
        >
          <Icon size={22} strokeWidth={2.2} />
        </div>

        <div className="min-w-0">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-[#00247D] dark:group-hover:text-blue-400 transition-colors">
            {contact.institution}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {contact.phoneNumber}
          </p>
        </div>
      </div>

      {/* Badge INTI & Icon Gembok */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <span className="bg-[#00247D] text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
          KONTAK INTI
        </span>

        <span
          className="text-slate-300 dark:text-slate-600 flex items-center"
          title="Kontak inti dilindungi sistem dan tidak dapat dihapus."
        >
          <Lock size={16} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
};

