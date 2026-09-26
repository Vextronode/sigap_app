import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  FileDown,
} from "lucide-react";
import { compressImageToWebp } from "../../../../utils/imageCompressor";
import type {
  PreparednessGuideRecord,
  GuideFormatType,
  GuideSourceType,
  CreatePreparednessGuideInput,
  UpdatePreparednessGuideInput,
} from "../../types/preparedness.types";

interface PreparednessGuideFormModalProps {
  isOpen: boolean;
  guide: PreparednessGuideRecord | null;
  onClose: () => void;
  onSubmit: (
    payload: CreatePreparednessGuideInput | UpdatePreparednessGuideInput
  ) => Promise<void>;
  isSubmitting: boolean;
  totalExistingGuides: number;
}

export const PreparednessGuideFormModal: React.FC<
  PreparednessGuideFormModalProps
> = (props) => {
  if (!props.isOpen) return null;

  return (
    <PreparednessGuideFormModalContent
      key={props.guide?.id ?? "create-new"}
      {...props}
    />
  );
};

const PreparednessGuideFormModalContent: React.FC<
  PreparednessGuideFormModalProps
> = ({
  guide,
  onClose,
  onSubmit,
  isSubmitting,
  totalExistingGuides,
}) => {
  const isEdit = Boolean(guide);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isExternalInitial = Boolean(
    guide?.externalUrl && guide.externalUrl.trim().length > 0
  );

  const [title, setTitle] = useState(guide?.title ?? "");
  const [formatType, setFormatType] = useState<GuideFormatType>(
    isExternalInitial ? "EXTERNAL_URL" : "ARTICLE"
  );
  const [sourceType, setSourceType] = useState<GuideSourceType>(
    guide?.sourceType ?? (isExternalInitial ? "MITRA" : "RESMI")
  );
  const [content, setContent] = useState(guide?.content ?? "");
  const [externalUrl, setExternalUrl] = useState(guide?.externalUrl ?? "");
  const [sourceLabel, setSourceLabel] = useState(
    guide?.sourceLabel ?? "Pemerintah Desa Cibenda"
  );
  const [imageUrl, setImageUrl] = useState(guide?.imageUrl ?? "");
  const [imagePreview, setImagePreview] = useState(guide?.imageUrl ?? "");
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tangani kompresi gambar saat admin memilih berkas lokal
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsCompressing(true);

    try {
      const compressedWebp = await compressImageToWebp(file, {
        maxWidth: 800,
        maxHeight: 450,
        quality: 0.8,
        maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
      });

      setImageUrl(compressedWebp);
      setImagePreview(compressedWebp);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memproses gambar.";
      setErrorMessage(message);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const isPdf = externalUrl.toLowerCase().includes(".pdf");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi kuota bila tambah baru
    if (!isEdit && totalExistingGuides >= 5) {
      setErrorMessage(
        "Batas kuota 5 panduan kesiapsiagaan telah tercapai. Harap hapus atau ubah panduan lama."
      );
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Judul panduan wajib diisi.");
      return;
    }

    if (title.length > 150) {
      setErrorMessage("Judul panduan maksimal 150 karakter.");
      return;
    }

    if (!imageUrl) {
      setErrorMessage(
        "Gambar sampul panduan wajib diunggah (maksimal 5 MB, otomatis dikonversi ke WebP)."
      );
      return;
    }

    if (formatType === "ARTICLE") {
      if (!content.trim()) {
        setErrorMessage(
          "Rincian deskripsi / instruksi mitigasi wajib diisi untuk panduan bertipe Artikel Mandiri."
        );
        return;
      }
    } else {
      if (!externalUrl.trim()) {
        setErrorMessage(
          "Tautan URL eksternal atau dokumen PDF wajib diisi untuk panduan bertipe Tautan Eksternal."
        );
        return;
      }
      if (
        !externalUrl.startsWith("http://") &&
        !externalUrl.startsWith("https://")
      ) {
        setErrorMessage("URL harus diawali dengan http:// atau https://");
        return;
      }
    }

    // Backend Prisma enum GuideSourceType: RESMI | MITRA
    const calculatedSourceType: GuideSourceType =
      sourceType || (formatType === "ARTICLE" ? "RESMI" : "MITRA");

    try {
      if (isEdit) {
        const payload: UpdatePreparednessGuideInput = {
          title: title.trim(),
          sourceType: calculatedSourceType,
          content: content.trim() || null,
          externalUrl: formatType === "EXTERNAL_URL" ? externalUrl.trim() : null,
          imageUrl,
          sourceLabel: sourceLabel.trim() || undefined,
        };
        await onSubmit(payload);
      } else {
        const payload: CreatePreparednessGuideInput = {
          title: title.trim(),
          sourceType: calculatedSourceType,
          content: content.trim() || null,
          externalUrl: formatType === "EXTERNAL_URL" ? externalUrl.trim() : null,
          imageUrl,
          sourceLabel: sourceLabel.trim() || undefined,
        };
        await onSubmit(payload);
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const respErr = errorObj.response?.data?.message || errorObj.message;
      setErrorMessage(respErr || "Gagal menyimpan panduan kesiapsiagaan.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit Panduan Kesiapsiagaan" : "Tambah Panduan Kesiapsiagaan"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola materi edukasi mitigasi bencana desa (Maksimal 5 panduan aktif).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isCompressing}
            aria-label="Tutup form"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Upload Gambar Sampul (Wajib) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Gambar Sampul Panduan <span className="text-rose-500">*</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              {/* Preview Gambar */}
              <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview Sampul"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 text-xs">
                    <ImageIcon size={28} className="mb-1" />
                    <span>Belum ada gambar</span>
                  </div>
                )}
                {/* Badge Rasio 16:9 */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white/90">
                  16:9
                </div>
                {isCompressing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white text-xs gap-1.5">
                    <Loader2 size={20} className="animate-spin text-blue-400" />
                    <span>Mengompres WebP...</span>
                  </div>
                )}
              </div>

              {/* Upload Input & Info */}
              <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={isSubmitting || isCompressing}
                  className="hidden"
                  id="guide-image-input"
                />
                <label
                  htmlFor="guide-image-input"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00247D] hover:bg-[#001b5e] text-white text-xs font-semibold shadow-xs cursor-pointer transition disabled:opacity-50"
                >
                  <Upload size={14} />
                  {imagePreview ? "Ganti Gambar Sampul" : "Pilih Gambar Sampul"}
                </label>
                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  <p>
                    <strong className="text-slate-800 dark:text-slate-200">Gunakan rasio 16:9</strong> (misal 1280×720 atau 800×450 px) agar foto pas di kartu warga dan tidak terpotong.
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Format JPG, PNG, atau WebP (maks. 5 MB). Gambar otomatis dikompresi ke WebP super ringan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Judul Panduan */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Judul Panduan <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] ${
                  title.length > 150
                    ? "text-rose-500 font-bold"
                    : "text-slate-400"
                }`}
              >
                {title.length} / 150
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Protokol Evakuasi Mandiri Gempa Megathrust"
              maxLength={150}
              required
              disabled={isSubmitting}
              style={{
                backgroundColor: "#f8fafc",
                color: "#0f172a",
                fontFamily: "var(--font-sans, inherit)",
              }}
              className="w-full px-4 py-2.5 font-sans text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 !bg-[#f8fafc] dark:!bg-slate-800/60 !text-slate-900 dark:!text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-[11px] sm:placeholder:text-xs focus:outline-hidden focus:ring-2 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30 transition"
            />
          </div>

          {/* Pilihan Tipe Panduan (Dual-Mode Switcher) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Format Tipe Panduan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormatType("ARTICLE");
                  setSourceType("RESMI");
                }}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  formatType === "ARTICLE"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    formatType === "ARTICLE"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Artikel Mandiri
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Teks deskripsi panduan yang dibaca langsung di aplikasi lewat pop-up dialog.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormatType("EXTERNAL_URL");
                  setSourceType("MITRA");
                }}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  formatType === "EXTERNAL_URL"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    formatType === "EXTERNAL_URL"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <LinkIcon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Tautan Eksternal / PDF
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Tautan ke dokumen resmi eksternal atau berkas PDF (contoh: BNPB/BPBD).
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Form Tautan jika Tipe EXTERNAL_URL */}
          {formatType === "EXTERNAL_URL" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tautan URL Eksternal / Saluran / PDF <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://whatsapp.com/channel/... atau https://bmkg.go.id/..."
                required
                disabled={isSubmitting}
                style={{
                  backgroundColor: "#f8fafc",
                  color: "#0f172a",
                  fontFamily: "var(--font-sans, inherit)",
                }}
                className="w-full px-4 py-2.5 font-sans text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 !bg-[#f8fafc] dark:!bg-slate-800/60 !text-slate-900 dark:!text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-[11px] sm:placeholder:text-xs focus:outline-hidden focus:ring-2 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30 transition"
              />

              {/* Indikator Deteksi Dokumen PDF */}
              {isPdf && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  <FileDown size={16} className="shrink-0 text-rose-600" />
                  <span>
                    <strong>Dokumen PDF Terdeteksi:</strong> Panduan ini akan diberi lencana
                    merah khusus <strong>[📄 Dokumen PDF]</strong> dan dibuka langsung di tab baru saat diklik warga.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Deskripsi & Rincian Panduan */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Deskripsi / Ringkasan Panduan{" "}
                {formatType === "ARTICLE" ? (
                  <span className="text-rose-500">*</span>
                ) : (
                  <span className="text-slate-400 font-normal lowercase">(opsional)</span>
                )}
              </label>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                formatType === "ARTICLE"
                  ? "Tuliskan poin mitigasi, instruksi penyelamatan, atau protokol kesiapsiagaan warga di sini..."
                  : "Ringkasan isi dokumen atau saluran resmi untuk warga (contoh: Update gempa & cuaca ekstrem BMKG)..."
              }
              rows={formatType === "ARTICLE" ? 5 : 3}
              required={formatType === "ARTICLE"}
              disabled={isSubmitting}
              style={{
                backgroundColor: "#f8fafc",
                color: "#0f172a",
                fontFamily: "var(--font-sans, inherit)",
              }}
              className="w-full px-3.5 py-2.5 font-sans text-[11px] sm:text-xs font-normal rounded-xl border border-slate-200 dark:border-slate-700 !bg-[#f8fafc] dark:!bg-slate-800/60 !text-slate-900 dark:!text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-[11px] sm:placeholder:text-xs focus:outline-hidden focus:ring-2 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30 min-h-[90px] resize-y leading-relaxed transition-colors"
            />
          </div>

          {/* Sumber Penerbit / Label */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Sumber Penerbit / Instansi
            </label>
            <input
              type="text"
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
              placeholder="Contoh: BMKG RI / BPBD Pangandaran / Pemerintah Desa Cibenda"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#f8fafc",
                color: "#0f172a",
                fontFamily: "var(--font-sans, inherit)",
              }}
              className="w-full px-3.5 py-2 font-sans text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 !bg-[#f8fafc] dark:!bg-slate-800/60 !text-slate-900 dark:!text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-[11px] sm:placeholder:text-xs focus:outline-hidden focus:ring-2 focus:ring-[#00247D]/20 dark:focus:ring-blue-500/30 transition"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isCompressing}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 transition disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Panduan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
