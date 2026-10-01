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
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { usePreparednessGuidesPublic } from "../../preparedness/hooks/usePreparednessGuides";
import { PreparednessGuideReaderModal } from "../../preparedness/components/modals/PreparednessGuideReaderModal";
import type { PreparednessGuideRecord } from "../../preparedness/types/preparedness.types";

export const PreparednessGuide = () => {
  const { data: guides, isLoading, isError } = usePreparednessGuidesPublic();
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 sm:gap-5 mt-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-card rounded-2xl border border-[color:var(--border)] overflow-hidden shadow-xs animate-pulse p-4 space-y-3"
            >
              <div className="aspect-[16/9] max-h-48 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
              <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="mt-4 p-8 text-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={24} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Gagal Memuat Panduan Kesiapsiagaan
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Terjadi kendala jaringan saat mengambil data panduan. Silakan periksa koneksi internet Anda atau hubungi pihak desa.
          </p>
        </Card>
      ) : displayGuides.length === 0 ? (
        <Card className="mt-4 p-8 text-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={24} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Belum Ada Panduan Kesiapsiagaan
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Belum ada panduan kesiapsiagaan yang dipublikasikan saat ini.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 sm:gap-5 mt-4">
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
                  {/* Container Foto Bersih & Terang (Tinggi Terkendali di Layar Lebar) */}
                  <div className="relative aspect-[16/9] max-h-48 sm:max-h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
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
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 pointer-events-auto">
                      {isArticle ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] sm:text-[11px] font-semibold backdrop-blur-md shadow-xs">
                          <FileText size={11} />
                          Artikel Mandiri
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/85 text-white text-[10px] sm:text-[11px] font-semibold backdrop-blur-md shadow-xs">
                          <ExternalLink size={11} />
                          Referensi Eksternal
                        </span>
                      )}

                      {isPdf && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] sm:text-[11px] font-bold backdrop-blur-md shadow-xs">
                          <FileDown size={11} />
                          Dokumen PDF
                        </span>
                      )}

                      {isWhatsApp && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold backdrop-blur-md shadow-xs">
                          <MessageCircle size={11} />
                          Saluran WhatsApp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bagian Konten Teks di Bawah Foto */}
                  <div className="p-3.5 sm:p-4 space-y-1.5">
                    {/* Instansi / Penerbit */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <Building2
                        size={12}
                        className="text-[#00247D] dark:text-blue-400 shrink-0"
                      />
                      <span className="truncate">
                        {guide.sourceLabel || "Pemerintah Desa Cibenda"}
                      </span>
                    </div>

                    {/* Judul Panduan (Biru Khas SIGAP, Ukuran Proporsional & Rapi) */}
                    <h3 className="text-xs sm:text-sm font-bold text-[#00247D] dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 leading-snug line-clamp-2 transition-colors">
                      {guide.title}
                    </h3>

                    {/* Teks Deskripsi yang Rapi */}
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-2">
                      {guide.content || defaultDescription}
                    </p>
                  </div>
                </div>

                {/* Bagian Bawah: Aksi Buka / Baca */}
                <div className="p-3.5 sm:p-4 pt-0 mt-1">
                  {isArticle ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedGuideForReader(guide)}
                      icon={<BookOpen size={14} />}
                      className="w-full flex items-center justify-center cursor-pointer text-xs font-semibold py-2"
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
                        className="w-full flex items-center justify-center cursor-pointer text-xs font-semibold py-2 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-300"
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
                            size={14}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                        }
                        className="w-full flex items-center justify-center cursor-pointer text-xs font-semibold py-2 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
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
                        icon={<ExternalLink size={14} />}
                        className="w-full flex items-center justify-center cursor-pointer text-xs font-semibold py-2"
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
