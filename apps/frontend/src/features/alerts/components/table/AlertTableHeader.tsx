import React from "react";

export const AlertTableHeader: React.FC = () => {
  return (
    <thead className="bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] font-semibold text-xs border-b border-[color:var(--border)]">
      <tr>
        <th scope="col" className="py-3.5 px-3 sm:px-4 font-semibold text-center w-12">
          No.
        </th>
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
          Lokasi Gempa
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
