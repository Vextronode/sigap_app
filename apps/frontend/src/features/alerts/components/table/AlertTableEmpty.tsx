import React from "react";
import { Filter } from "lucide-react";

export const AlertTableEmpty: React.FC = () => {
  return (
    <tr>
      <td colSpan={6} className="py-12 px-4 text-center bg-white">
        <div className="max-w-xs mx-auto space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Filter size={20} />
          </div>
          <p className="font-semibold text-slate-800 text-sm">
            Tidak Ada Data Alert
          </p>
          <p className="text-xs text-slate-500">
            Tidak ditemukan riwayat alert yang cocok dengan kriteria filter atau pencarian saat ini.
          </p>
        </div>
      </td>
    </tr>
  );
};
