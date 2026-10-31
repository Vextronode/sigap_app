import React from "react";
import { X, BookOpen, Calendar, Building2, ExternalLink } from "lucide-react";
import type { PreparednessGuideRecord } from "../../types/preparedness.types";

interface PreparednessGuideReaderModalProps {
  guide: PreparednessGuideRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PreparednessGuideReaderModal: React.FC<
  PreparednessGuideReaderModalProps
> = ({ guide, isOpen, onClose }) => {
  if (!isOpen || !guide) return null;

  const formattedDate = guide.publishedAt
    ? new Date(guide.publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <BookOpen size={18} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Artikel Panduan Kesiapsiagaan
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela baca panduan"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Cover Image */}
          {guide.imageUrl && (
            <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-800">
              <img
                src={guide.imageUrl}
                alt={guide.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {guide.sourceLabel && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                <Building2 size={13} className="text-blue-500" />
                {guide.sourceLabel}
              </span>
            )}
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} />
                {formattedDate}
              </span>
            )}
          </div>

          {/* Judul Artikel */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {guide.title}
          </h2>

          {/* Isi Konten Artikel */}
          <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line pt-2 border-t border-slate-100 dark:border-slate-800">
            {guide.content || (
              <p className="italic text-slate-400">
                Belum ada rincian deskripsi untuk artikel ini.
              </p>
            )}
          </div>

          {/* Optional External URL fallback if present */}
          {guide.externalUrl && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                  Tautan Tambahan Terkait
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 truncate max-w-sm">
                  {guide.externalUrl}
                </p>
              </div>
              <a
                href={guide.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Kunjungi <ExternalLink size={13} />
              </a>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
