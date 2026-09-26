import React from "react";
import {
  BookOpen,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  FileDown,
  Building2,
  Calendar,
} from "lucide-react";
import type { PreparednessGuideRecord } from "../types/preparedness.types";

interface PreparednessGuideCardsProps {
  guides: PreparednessGuideRecord[];
  isLoading: boolean;
  onEdit: (guide: PreparednessGuideRecord) => void;
  onDelete: (guide: PreparednessGuideRecord) => void;
  onPreview: (guide: PreparednessGuideRecord) => void;
}

export const PreparednessGuideCards: React.FC<PreparednessGuideCardsProps> = ({
  guides,
  isLoading,
  onEdit,
  onDelete,
  onPreview,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden p-5 space-y-4"
          >
            <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (guides.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <BookOpen size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-900 dark:text-white">
          Belum Ada Panduan Kesiapsiagaan
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
          Tambahkan panduan pertama untuk warga desa (maksimal 5 panduan aktif).
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {guides.map((guide) => {
        const isExternal = Boolean(guide.externalUrl && guide.externalUrl.trim().length > 0);
        const isArticle = !isExternal;
        const isPdf = isExternal && (guide.externalUrl?.toLowerCase().includes(".pdf") ?? false);

        const formattedDate = guide.publishedAt
          ? new Date(guide.publishedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : null;

        return (
          <div
            key={guide.id}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            {/* Bagian Atas: Cover Image & Info Header */}
            <div>
              {/* Gambar Sampul (Tanpa Overlay Gelap) */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                {guide.imageUrl ? (
                  <img
                    src={guide.imageUrl}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <BookOpen size={36} />
                  </div>
                )}

                {/* Badge di atas gambar */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-auto">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {isArticle ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-semibold backdrop-blur-md shadow-xs">
                        <FileText size={12} />
                        Artikel Mandiri
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/85 text-white text-[11px] font-semibold backdrop-blur-md shadow-xs">
                        <ExternalLink size={12} />
                        Tautan Eksternal
                      </span>
                    )}

                    {isPdf && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold backdrop-blur-md shadow-xs">
                        <FileDown size={12} />
                        Dokumen PDF
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rincian Ringkas di Bawah Foto */}
              <div className="p-4 sm:p-5 space-y-2.5">
                {/* Meta Penerbit & Tanggal */}
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {guide.sourceLabel && (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Building2 size={12} className="text-[#00247D] dark:text-blue-400" />
                      {guide.sourceLabel}
                    </span>
                  )}
                  {formattedDate && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {formattedDate}
                    </span>
                  )}
                </div>

                {/* Judul di Bawah Foto (Warna Biru Khas SIGAP, Ukuran Proporsional) */}
                <h3 className="text-sm sm:text-base font-bold text-[#00247D] dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 line-clamp-2 leading-snug transition-colors">
                  {guide.title}
                </h3>

                {/* Snippet Teks atau Link */}
                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {guide.content || (
                    isExternal
                      ? `Materi rujukan resmi dari ${guide.sourceLabel || "instansi terkait"}. Buka tautan untuk mengakses panduan lengkap.`
                      : "Belum ada rincian deskripsi panduan."
                  )}
                </p>

                {isExternal && guide.externalUrl && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Target URL Referensi:
                    </p>
                    <a
                      href={guide.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline truncate block font-medium mt-0.5"
                    >
                      {guide.externalUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bagian Bawah: Aksi */}
            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between gap-2">
              {/* Tombol Pratinjau / Buka */}
              {isArticle ? (
                <button
                  type="button"
                  onClick={() => onPreview(guide)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  <BookOpen size={13} />
                  Pratinjau Pop-up
                </button>
              ) : (
                <a
                  href={guide.externalUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  <ExternalLink size={13} />
                  Buka Tautan
                </a>
              )}

              {/* Tombol Edit & Hapus */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(guide)}
                  aria-label="Edit Panduan"
                  className="p-2 rounded-xl text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(guide)}
                  aria-label="Hapus Panduan"
                  className="p-2 rounded-xl text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
