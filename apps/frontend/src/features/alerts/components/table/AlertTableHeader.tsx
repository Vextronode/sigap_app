import React from "react";

export const AlertTableHeader: React.FC = () => {
  return (
    <thead className="bg-slate-50/90 text-slate-500 font-semibold text-xs border-b border-slate-200/80">
      <tr>
        <th scope="col" className="py-3.5 px-4 sm:px-6 font-semibold">
          Waktu & Tanggal
        </th>
        <th scope="col" className="py-3.5 px-4 font-semibold">
          Tingkat Bahaya
        </th>
        <th scope="col" className="py-3.5 px-4 font-semibold">
          Sumber
        </th>
        <th scope="col" className="py-3.5 px-4 font-semibold">
          Deskripsi Alert
        </th>
        <th scope="col" className="py-3.5 px-4 font-semibold">
          Status Verifikasi
        </th>
        <th scope="col" className="py-3.5 px-4 sm:px-6 font-semibold text-right">
          Aksi
        </th>
      </tr>
    </thead>
  );
};
