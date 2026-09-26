import { useState } from "react";
import {
  BookOpen,
  ExternalLink,
  FileDown,
  FileText,
  Building2,
  MessageCircle,
} from "lucide-react";
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
              <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
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
            const isExternal = Boolean(
              guide.externalUrl && guide.externalUrl.trim().length > 0
            );
            const isArticle = !isExternal;
            const isPdf =
              isExternal &&
              (guide.externalUrl?.toLowerCase().includes(".pdf") ?? false);
            const isWhatsApp =
              isExternal &&
              (guide.externalUrl?.toLowerCase().includes("whatsapp.com") ??
                false);

            const defaultDescription = isExternal
              ? isWhatsApp
                ? "Saluran komunikasi resmi dari BMKG untuk pembaruan cepat cuaca ekstrem, peringatan dini gempa bumi terkini, dan informasi mitigasi bencana langsung di WhatsApp."
                : isPdf
                ? `Dokumen panduan resmi rujukan dari ${
                    guide.sourceLabel || "instansi terkait"
                  }. Akses dokumen PDF lengkap untuk membaca materi kesiapsiagaan selengkapnya.`
                : `Materi edukasi dan rujukan resmi kesiapsiagaan bencana dari ${
                    guide.sourceLabel || "instansi terkait"
                  }. Buka tautan untuk mengakses panduan lengkap.`
              : "Panduan kesiapsiagaan dan mitigasi bencana resmi bagi warga Desa Cibenda.";

            return (
              <article
                className="group bg-card rounded-2xl border border-[color:var(--border)] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                key={guide.id}
              >
                {/* Bagian Atas: Gambar Sampul & Info */}
                <div>
                  {/* Container Foto Bersih & Terang (Tidak Tertutup Overlay Gelap) */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={
                        guide.imageUrl ||
                        "/assets/image/earthquake-ilustration.webp"
                      }
                      alt={guide.title}
                      loading="lazy"
                    />

                    {/* Floating Badges di Atas Foto */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-auto">
                      {isArticle ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-semibold backdrop-blur-md shadow-xs">
                          <FileText size={12} />
                          Artikel Mandiri
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/85 text-white text-[11px] font-semibold backdrop-blur-md shadow-xs">
                          <ExternalLink size={12} />
                          Referensi Eksternal
                        </span>
                      )}

                      {isPdf && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold backdrop-blur-md shadow-xs">
                          <FileDown size={12} />
                          Dokumen PDF
                        </span>
                      )}

                      {isWhatsApp && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold backdrop-blur-md shadow-xs">
                          <MessageCircle size={12} />
                          Saluran WhatsApp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bagian Konten Teks di Bawah Foto */}
                  <div className="p-4 sm:p-5 space-y-2">
                    {/* Instansi / Penerbit */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Building2
                        size={13}
                        className="text-[#00247D] dark:text-blue-400 shrink-0"
                      />
                      <span className="truncate">
                        {guide.sourceLabel || "Pemerintah Desa Cibenda"}
                      </span>
                    </div>

                    {/* Judul Panduan (Biru Khas SIGAP, Ukuran Proporsional & Rapi) */}
                    <h3 className="text-sm sm:text-base font-bold text-[#00247D] dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 leading-snug line-clamp-2 transition-colors">
                      {guide.title}
                    </h3>

                    {/* Teks Deskripsi yang Rapi */}
                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-3">
                      {guide.content || defaultDescription}
                    </p>
                  </div>
                </div>

                {/* Bagian Bawah: Aksi Buka / Baca */}
                <div className="p-4 sm:p-5 pt-0 mt-2">
                  {isArticle ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedGuideForReader(guide)}
                      icon={<BookOpen size={15} />}
                      className="w-full flex items-center justify-center cursor-pointer text-xs sm:text-sm font-semibold py-2.5"
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
                        icon={
                          <FileDown
                            size={15}
                            className="text-rose-600 dark:text-rose-400"
                          />
                        }
                        className="w-full flex items-center justify-center cursor-pointer text-xs sm:text-sm font-semibold py-2.5 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-300"
                      >
                        Buka Dokumen PDF
                      </Button>
                    </a>
                  ) : isWhatsApp ? (
                    <a
                      href={guide.externalUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        icon={
                          <MessageCircle
                            size={15}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                        }
                        className="w-full flex items-center justify-center cursor-pointer text-xs sm:text-sm font-semibold py-2.5 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                      >
                        Buka Saluran WhatsApp
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
                        icon={<ExternalLink size={15} />}
                        className="w-full flex items-center justify-center cursor-pointer text-xs sm:text-sm font-semibold py-2.5"
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
