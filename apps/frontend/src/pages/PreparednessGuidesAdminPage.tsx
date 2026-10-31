import { useState } from "react";
import { Plus } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  usePreparednessGuidesAdmin,
  useCreatePreparednessGuide,
  useUpdatePreparednessGuide,
  useDeletePreparednessGuide,
} from "../features/preparedness/hooks/usePreparednessGuides";
import { PreparednessGuideCards } from "../features/preparedness/components/PreparednessGuideCards";
import { PreparednessGuideFormModal } from "../features/preparedness/components/modals/PreparednessGuideFormModal";
import { PreparednessGuideDeleteModal } from "../features/preparedness/components/modals/PreparednessGuideDeleteModal";
import { PreparednessGuideReaderModal } from "../features/preparedness/components/modals/PreparednessGuideReaderModal";
import { ActionFeedbackModal } from "../components/common/ActionFeedbackModal";
import { parseApiError } from "../utils/errorParser";
import type {
  PreparednessGuideRecord,
  CreatePreparednessGuideInput,
  UpdatePreparednessGuideInput,
} from "../features/preparedness/types/preparedness.types";

export default function PreparednessGuidesAdminPage() {
  useDocumentTitle("Kelola Panduan Kesiapsiagaan - SIGAP Desa Cibenda");

  // React Queries & Mutations untuk Panduan Kesiapsiagaan
  const guidesQuery = usePreparednessGuidesAdmin();
  const createGuideMutation = useCreatePreparednessGuide();
  const updateGuideMutation = useUpdatePreparednessGuide();
  const deleteGuideMutation = useDeletePreparednessGuide();

  const guides = guidesQuery.data ?? [];

  // State Modal Form Panduan (Tambah / Edit)
  const [isGuideFormOpen, setIsGuideFormOpen] = useState(false);
  const [selectedGuideForEdit, setSelectedGuideForEdit] =
    useState<PreparednessGuideRecord | null>(null);

  // State Modal Hapus Panduan
  const [isGuideDeleteOpen, setIsGuideDeleteOpen] = useState(false);
  const [selectedGuideForDelete, setSelectedGuideForDelete] =
    useState<PreparednessGuideRecord | null>(null);

  // State Modal Baca Pratinjau
  const [isGuideReaderOpen, setIsGuideReaderOpen] = useState(false);
  const [selectedGuideForReader, setSelectedGuideForReader] =
    useState<PreparednessGuideRecord | null>(null);

  // State Pop-up Notifikasi (ActionFeedbackModal)
  const [popupFeedback, setPopupFeedback] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const showPopup = (
    type: "success" | "error" | "info",
    message: string,
    title?: string
  ) => {
    setPopupFeedback({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  // Handlers Panduan Kesiapsiagaan
  const handleOpenCreateGuide = () => {
    if (guides.length >= 5) {
      showPopup(
        "error",
        "Batas kuota 5 panduan kesiapsiagaan telah tercapai. Harap hapus panduan lama untuk menambah baru.",
        "Kuota Maksimal Tercapai"
      );
      return;
    }
    setSelectedGuideForEdit(null);
    setIsGuideFormOpen(true);
  };

  const handleOpenEditGuide = (guide: PreparednessGuideRecord) => {
    setSelectedGuideForEdit(guide);
    setIsGuideFormOpen(true);
  };

  const handleOpenDeleteGuide = (guide: PreparednessGuideRecord) => {
    setSelectedGuideForDelete(guide);
    setIsGuideDeleteOpen(true);
  };

  const handleOpenPreviewGuide = (guide: PreparednessGuideRecord) => {
    setSelectedGuideForReader(guide);
    setIsGuideReaderOpen(true);
  };

  const handleGuideFormSubmit = async (
    payload: CreatePreparednessGuideInput | UpdatePreparednessGuideInput
  ) => {
    if (selectedGuideForEdit) {
      await updateGuideMutation.mutateAsync({
        id: selectedGuideForEdit.id,
        payload,
      });
      showPopup(
        "success",
        `Panduan kesiapsiagaan "${payload.title}" berhasil diperbarui. Perubahan langsung disinkronkan ke dashboard warga.`,
        "Perubahan Disimpan"
      );
    } else {
      await createGuideMutation.mutateAsync(
        payload as CreatePreparednessGuideInput
      );
      showPopup(
        "success",
        `Panduan kesiapsiagaan "${payload.title}" berhasil ditambahkan. Warga kini dapat mengakses panduan ini.`,
        "Panduan Baru Ditambahkan"
      );
    }
    setIsGuideFormOpen(false);
    setSelectedGuideForEdit(null);
  };

  const handleGuideDeleteConfirm = async () => {
    if (!selectedGuideForDelete) return;

    try {
      await deleteGuideMutation.mutateAsync(selectedGuideForDelete.id);
      showPopup(
        "success",
        `Panduan "${selectedGuideForDelete.title}" dan berkas gambar sampulnya berhasil dihapus secara permanen.`,
        "Panduan Berhasil Dihapus"
      );
      setIsGuideDeleteOpen(false);
      setSelectedGuideForDelete(null);
    } catch (err: unknown) {
      const errorMsg = parseApiError(err);
      showPopup("error", `Gagal menghapus panduan: ${errorMsg}`, "Gagal Menghapus");
    }
  };

  const isGuideSubmitting =
    createGuideMutation.isPending || updateGuideMutation.isPending;
  const isGuideDeleting = deleteGuideMutation.isPending;

  return (
    <div className="w-full space-y-6 pb-14 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Kelola Panduan Kesiapsiagaan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola hingga 5 artikel edukasi kebencanaan aktif untuk kesiapsiagaan warga Desa Cibenda.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateGuide}
          disabled={guides.length >= 5}
          title={
            guides.length >= 5
              ? "Batas kuota 5 panduan tercapai"
              : "Tambah Panduan Kesiapsiagaan Baru"
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00247D] hover:bg-[#001d66] disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Panduan</span>
        </button>
      </div>

      {/* Konten Panduan Kesiapsiagaan */}
      <div className="space-y-6">
        {/* Banner Kuota Penyimpanan Desa */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Kapasitas Kuota Panduan Desa
              </span>
              {guides.length >= 5 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                  Maksimal Tercapai
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {guides.length} dari 5 Panduan Kesiapsiagaan Aktif
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola materi edukasi tanggap darurat dan mitigasi risiko bencana bagi seluruh warga.
            </p>
          </div>

          {/* Progress Bar Visual */}
          <div className="w-full md:w-64 space-y-1.5">
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  guides.length >= 5
                    ? "bg-rose-500"
                    : guides.length >= 3
                    ? "bg-amber-500"
                    : "bg-blue-600"
                }`}
                style={{
                  width: `${Math.min((guides.length / 5) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px]">
              <span
                className={
                  guides.length >= 5
                    ? "text-rose-600 dark:text-rose-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 font-medium"
                }
              >
                {guides.length} Panduan
              </span>
              <span
                className={
                  guides.length >= 5
                    ? "text-rose-600 dark:text-rose-400 font-bold"
                    : "text-slate-500 dark:text-slate-400"
                }
              >
                Maks. 5 Panduan
              </span>
            </div>
          </div>
        </div>

        {/* Grid Kartu Panduan Kesiapsiagaan */}
        <PreparednessGuideCards
          guides={guides}
          isLoading={guidesQuery.isLoading}
          onEdit={handleOpenEditGuide}
          onDelete={handleOpenDeleteGuide}
          onPreview={handleOpenPreviewGuide}
        />
      </div>

      {/* Modal Panduan Kesiapsiagaan */}
      <PreparednessGuideFormModal
        isOpen={isGuideFormOpen}
        guide={selectedGuideForEdit}
        onClose={() => {
          setIsGuideFormOpen(false);
          setSelectedGuideForEdit(null);
        }}
        onSubmit={handleGuideFormSubmit}
        isSubmitting={isGuideSubmitting}
        totalExistingGuides={guides.length}
      />

      <PreparednessGuideDeleteModal
        isOpen={isGuideDeleteOpen}
        guide={selectedGuideForDelete}
        onClose={() => {
          setIsGuideDeleteOpen(false);
          setSelectedGuideForDelete(null);
        }}
        onConfirm={handleGuideDeleteConfirm}
        isDeleting={isGuideDeleting}
      />

      <PreparednessGuideReaderModal
        isOpen={isGuideReaderOpen}
        guide={selectedGuideForReader}
        onClose={() => {
          setIsGuideReaderOpen(false);
          setSelectedGuideForReader(null);
        }}
      />

      {/* Pop-up Notifikasi Hasil Aksi Admin */}
      <ActionFeedbackModal
        isOpen={popupFeedback.isOpen}
        type={popupFeedback.type}
        title={popupFeedback.title}
        message={popupFeedback.message}
        onClose={() =>
          setPopupFeedback((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}
