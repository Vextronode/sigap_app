import { useState } from "react";
import { BookOpen, ExternalLink, FileDown, FileText, Building2 } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { usePreparednessGuidesPublic } from "../../preparedness/hooks/usePreparednessGuides";
import { PreparednessGuideReaderModal } from "../../preparedness/components/modals/PreparednessGuideReaderModal";
import type { PreparednessGuideRecord } from "../../preparedness/types/preparedness.types";

export const PreparednessGuide = () => {
  const { data: guides, isLoading } = usePreparednessGuidesPublic();
  const [selectedGuideForReader, setSelectedGuideForReader] =
    useState<PreparednessGuideRecord | null>(null);

  const displayGuides: PreparednessGuideRecord[] =
    guides && guides.length > 0 ? guides : [];

  return (
    <section aria-labelledby="preparedness" className="w-full">
      <SectionHeader
        id="preparedness"
        title="Panduan Kesiapsiagaan"
        icon={<BookOpen size={22} />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="bg-card rounded-2xl border border-[color:var(--border)] overflow-hidden shadow-xs animate-pulse p-4 space-y-4"
            >
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : displayGuides.length === 0 ? (
        <div className="mt-4 p-8 rounded-2xl border border-[color:var(--border)] bg-card text-center space-y-2">
          <BookOpen size={28} className="mx-auto text-muted-foreground" />
          <p className="text-sm text-foreground/80 font-medium">
            Belum ada panduan kesiapsiagaan yang dipublikasikan saat ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {displayGuides.map((guide) => {
            const isExternal = Boolean(guide.externalUrl && guide.externalUrl.trim().length > 0);
            const isArticle = !isExternal;
            const isPdf = isExternal && (guide.externalUrl?.toLowerCase().includes(".pdf") ?? false);

            return (
              <article
                className="bg-card rounded-2xl border border-[color:var(--border)] overflow-hidden shadow-xs flex flex-col justify-between transition hover:shadow-md"
                key={guide.id}
              >
                {/* Bagian Atas: Gambar Sampul & Judul */}
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      src={guide.imageUrl || "/assets/image/earthquake-ilustration.webp"}
                      alt={guide.title}
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-between p-4 pointer-events-none">
                      {/* Badge Tipe di Atas Gambar */}
                      <div className="flex items-center gap-2 pointer-events-auto">
                        {isArticle ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-semibold backdrop-blur-xs">
                            <FileText size={12} />
                            Artikel Mandiri
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 text-white text-[11px] font-semibold backdrop-blur-xs">
                            <ExternalLink size={12} />
                            Referensi Eksternal
                          </span>
                        )}

                        {isPdf && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold backdrop-blur-xs shadow-xs animate-pulse">
                            <FileDown size={12} />
                            📄 Dokumen PDF
                          </span>
                        )}
                      </div>

                      {/* Judul di Dasar Gambar */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide drop-shadow-sm line-clamp-2 leading-snug">
                          {guide.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Isi Ringkasan / Deskripsi */}
                  <div className="p-5 space-y-3">
                    {guide.sourceLabel && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Building2 size={13} className="text-blue-500" />
                        <span>Penerbit: {guide.sourceLabel}</span>
                      </div>
                    )}

                    <p className="text-sm text-foreground/80 leading-relaxed font-normal line-clamp-4 whitespace-pre-line">
                      {guide.content || (
                        guide.externalUrl
                          ? `Panduan kesiapsiagaan resmi rujukan dari ${guide.sourceLabel || "instansi terkait"}. Akses dokumen lengkap melalui tautan referensi.`
                          : "Panduan kesiapsiagaan bencana warga Desa Cibenda."
                      )}
                    </p>
                  </div>
                </div>

                {/* Bagian Bawah: Aksi Buka / Baca */}
                <div className="p-5 pt-0">
                  {isArticle ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedGuideForReader(guide)}
                      icon={<BookOpen size={16} />}
                      className="w-full flex items-center justify-center cursor-pointer"
                    >
                      Baca Panduan Lengkap
                    </Button>
                  ) : isPdf ? (
                    <a
                      href={guide.externalUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        icon={<FileDown size={16} className="text-rose-600 dark:text-rose-400" />}
                        className="w-full flex items-center justify-center cursor-pointer border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-300"
                      >
                        Buka Dokumen PDF
                      </Button>
                    </a>
                  ) : (
                    <a
                      href={guide.externalUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        icon={<ExternalLink size={16} />}
                        className="w-full flex items-center justify-center cursor-pointer"
                      >
                        Kunjungi Tautan Referensi
                      </Button>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Baca Artikel Lengkap */}
      <PreparednessGuideReaderModal
        isOpen={Boolean(selectedGuideForReader)}
        guide={selectedGuideForReader}
        onClose={() => setSelectedGuideForReader(null)}
      />
    </section>
  );
};
