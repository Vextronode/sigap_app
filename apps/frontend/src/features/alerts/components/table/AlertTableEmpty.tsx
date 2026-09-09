import React from "react";
import { Filter } from "lucide-react";

export const AlertTableEmpty: React.FC = () => {
  return (
    <tr>
      <td colSpan={8} className="py-12 px-4 text-center bg-[color:var(--surface)]">
        <div className="max-w-xs mx-auto space-y-2">
          <div className="w-10 h-10 rounded-full bg-[color:var(--surface-muted)] flex items-center justify-center mx-auto text-[color:var(--text-muted)]">
            <Filter size={20} />
          </div>
          <p className="font-semibold text-[color:var(--text)] text-sm">
            Data Gempa Tidak Ditemukan
          </p>
          <p className="text-xs text-[color:var(--text-muted)]">
            Tidak ada riwayat telemetri gempa yang cocok dengan kata kunci pencarian atau filter yang dipilih.
          </p>
        </div>
      </td>
    </tr>
  );
};
