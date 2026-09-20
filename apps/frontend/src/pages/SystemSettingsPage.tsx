import { useState } from "react";
import { Plus, MapPin, BookOpen, Mountain, Users, ShieldCheck } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  useEmergencyContactsList,
  useCreateEmergencyContact,
  useUpdateEmergencyContact,
  useDeleteEmergencyContact,
} from "../features/emergency-contacts/hooks/useEmergencyContactsAdmin";
import {
  useEvacuationPointsList,
  useCreateEvacuationPoint,
  useUpdateEvacuationPoint,
  useDeleteEvacuationPoint,
} from "../features/evacuation/hooks/useEvacuationPointsAdmin";
import { EmergencyContactFeedbackBanner } from "../features/emergency-contacts/components/EmergencyContactFeedbackBanner";
import { CoreContactsSection } from "../features/emergency-contacts/components/sections/CoreContactsSection";
import { AdditionalContactsSection } from "../features/emergency-contacts/components/sections/AdditionalContactsSection";
import { EmergencyContactFormModal } from "../features/emergency-contacts/components/modals/EmergencyContactFormModal";
import { EmergencyContactDeleteModal } from "../features/emergency-contacts/components/modals/EmergencyContactDeleteModal";
import { EvacuationOverviewMap } from "../features/evacuation/components/EvacuationOverviewMap";
import { EvacuationPointCards } from "../features/evacuation/components/EvacuationPointCards";
import { EvacuationPointFormModal } from "../features/evacuation/components/modals/EvacuationPointFormModal";
import { EvacuationPointDeleteModal } from "../features/evacuation/components/modals/EvacuationPointDeleteModal";
import type { EmergencyIconKey } from "../features/emergency-contacts/utils/emergencyIconPresets";
import type {
  EmergencyContactRecord,
  EmergencyContactFeedback,
} from "../types/emergencyContact";
import type { EvacuationPoint } from "../types/dashboard";
import type { EvacuationPointPayload } from "../services/evacuationService";

type SettingsTab = "contacts" | "evacuation" | "guides";

export default function SystemSettingsPage() {
  useDocumentTitle("Kelola Kesiapsiagaan Desa - SIGAP Desa Cibenda");

  // State Tab Aktif
  const [activeTab, setActiveTab] = useState<SettingsTab>("contacts");

  // React Queries & Mutations untuk Kontak Darurat
  const contactsQuery = useEmergencyContactsList();
  const createMutation = useCreateEmergencyContact();
  const updateMutation = useUpdateEmergencyContact();
  const deleteMutation = useDeleteEmergencyContact();

  // React Queries & Mutations untuk Titik Evakuasi
  const evacuationQuery = useEvacuationPointsList();
  const createEvacuationMutation = useCreateEvacuationPoint();
  const updateEvacuationMutation = useUpdateEvacuationPoint();
  const deleteEvacuationMutation = useDeleteEvacuationPoint();

  // State Modal Form Kontak (Tambah / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedContactForEdit, setSelectedContactForEdit] =
    useState<EmergencyContactRecord | null>(null);

  // State Modal Hapus Kontak
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContactForDelete, setSelectedContactForDelete] =
    useState<EmergencyContactRecord | null>(null);

  // State Modal Form Titik Evakuasi (Tambah / Edit)
  const [isEvacuationFormOpen, setIsEvacuationFormOpen] = useState(false);
  const [selectedEvacuationForEdit, setSelectedEvacuationForEdit] =
    useState<EvacuationPoint | null>(null);

  // State Modal Hapus Titik Evakuasi
  const [isEvacuationDeleteOpen, setIsEvacuationDeleteOpen] = useState(false);
  const [selectedEvacuationForDelete, setSelectedEvacuationForDelete] =
    useState<EvacuationPoint | null>(null);

  // State Titik Evakuasi yang Disorot di Peta
  const [highlightedPointId, setHighlightedPointId] = useState<string | null>(null);

  // State Feedback Notifikasi
  const [feedback, setFeedback] = useState<EmergencyContactFeedback | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    if (type === "success") {
      setTimeout(() => {
        setFeedback((prev) => (prev?.message === message ? null : prev));
      }, 5000);
    }
  };

  // Handlers Kontak Darurat
  const handleOpenCreate = () => {
    setSelectedContactForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (contact: EmergencyContactRecord) => {
    setSelectedContactForEdit(contact);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (contact: EmergencyContactRecord) => {
    setSelectedContactForDelete(contact);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (payload: {
    institution: string;
    phoneNumber: string;
    iconKey: EmergencyIconKey;
  }) => {
    try {
      const apiPayload = {
        institution: payload.institution,
        phoneNumber: payload.phoneNumber,
        icon: payload.iconKey,
      };

      if (selectedContactForEdit) {
        await updateMutation.mutateAsync({
          id: selectedContactForEdit.id,
          payload: apiPayload,
        });
        showFeedback(
          "success",
          `Kontak darurat "${payload.institution}" berhasil diperbarui.`
        );
      } else {
        await createMutation.mutateAsync(apiPayload);
        showFeedback(
          "success",
          `Kontak darurat "${payload.institution}" berhasil ditambahkan.`
        );
      }
      setIsFormModalOpen(false);
      setSelectedContactForEdit(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.";
      showFeedback("error", `Gagal menyimpan: ${errorMsg}`);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContactForDelete) return;

    try {
      await deleteMutation.mutateAsync(selectedContactForDelete.id);
      showFeedback(
        "success",
        `Kontak darurat "${selectedContactForDelete.institution}" berhasil dihapus.`
      );
      setIsDeleteModalOpen(false);
      setSelectedContactForDelete(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus data.";
      showFeedback("error", `Gagal menghapus kontak: ${errorMsg}`);
    }
  };

  // Handlers Titik Evakuasi
  const handleOpenCreateEvacuation = () => {
    setSelectedEvacuationForEdit(null);
    setIsEvacuationFormOpen(true);
  };

  const handleOpenEditEvacuation = (point: EvacuationPoint) => {
    setSelectedEvacuationForEdit(point);
    setIsEvacuationFormOpen(true);
  };

  const handleOpenDeleteEvacuation = (point: EvacuationPoint) => {
    setSelectedEvacuationForDelete(point);
    setIsEvacuationDeleteOpen(true);
  };

  const handleEvacuationFormSubmit = async (payload: EvacuationPointPayload) => {
    try {
      if (selectedEvacuationForEdit) {
        await updateEvacuationMutation.mutateAsync({
          id: selectedEvacuationForEdit.id,
          payload,
        });
        showFeedback(
          "success",
          `Titik evakuasi "${payload.name}" berhasil diperbarui.`
        );
      } else {
        await createEvacuationMutation.mutateAsync(payload);
        showFeedback(
          "success",
          `Titik evakuasi "${payload.name}" berhasil ditambahkan.`
        );
      }
      setIsEvacuationFormOpen(false);
      setSelectedEvacuationForEdit(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.";
      showFeedback("error", `Gagal menyimpan titik evakuasi: ${errorMsg}`);
      throw err;
    }
  };

  const handleEvacuationDeleteConfirm = async () => {
    if (!selectedEvacuationForDelete) return;

    try {
      await deleteEvacuationMutation.mutateAsync(selectedEvacuationForDelete.id);
      showFeedback(
        "success",
        `Titik evakuasi "${selectedEvacuationForDelete.name}" berhasil dihapus.`
      );
      setIsEvacuationDeleteOpen(false);
      setSelectedEvacuationForDelete(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus data.";
      showFeedback("error", `Gagal menghapus titik: ${errorMsg}`);
    }
  };

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const isEvacuationSubmitting =
    createEvacuationMutation.isPending || updateEvacuationMutation.isPending;
  const isEvacuationDeleting = deleteEvacuationMutation.isPending;

  // Statistik Titik Evakuasi
  const evacuationPoints = evacuationQuery.data ?? [];
  const totalCapacity = evacuationPoints.reduce(
    (acc, p) => acc + (p.capacity ?? 0),
    0
  );
  const highestElevation = evacuationPoints.reduce(
    (max, p) => (p.elevation && p.elevation > max ? p.elevation : max),
    0
  );

  return (
    <div className="w-full space-y-6 pb-14 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Kelola Kesiapsiagaan Desa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola kontak darurat desa, rute evakuasi bencana, dan protokol kesiapsiagaan warga.
          </p>
        </div>

        {activeTab === "contacts" && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00247D] hover:bg-[#001d66] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Tambah Kontak</span>
          </button>
        )}

        {activeTab === "evacuation" && (
          <button
            type="button"
            onClick={handleOpenCreateEvacuation}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00247D] hover:bg-[#001d66] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Tambah Titik Evakuasi</span>
          </button>
        )}
      </div>

      {/* Navigasi Tab */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex items-center gap-8 -mb-px overflow-x-auto" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("contacts")}
            className={`pb-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${activeTab === "contacts"
                ? "border-[#00247D] text-[#00247D] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
          >
            Kontak Darurat
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evacuation")}
            className={`pb-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${activeTab === "evacuation"
                ? "border-[#00247D] text-[#00247D] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
          >
            <span>Titik & Jalur Evakuasi</span>
            {evacuationPoints.length > 0 && (
              <span className="px-2 py-0.5 text-[11px] rounded-full bg-blue-100 dark:bg-blue-950 text-[#00247D] dark:text-blue-300 font-semibold">
                {evacuationPoints.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("guides")}
            className={`pb-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${activeTab === "guides"
                ? "border-[#00247D] text-[#00247D] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
          >
            Panduan Kesiapsiagaan
          </button>
        </nav>
      </div>

      {/* Banner Feedback Notifikasi */}
      <EmergencyContactFeedbackBanner
        feedback={feedback}
        onDismiss={() => setFeedback(null)}
      />

      {/* Konten Tab 1: Kontak Darurat */}
      {activeTab === "contacts" && (
        <div className="space-y-6">
          <CoreContactsSection
            contacts={contactsQuery.data ?? []}
            isLoading={contactsQuery.isLoading}
            onEdit={handleOpenEdit}
          />
          <AdditionalContactsSection
            contacts={contactsQuery.data ?? []}
            isLoading={contactsQuery.isLoading}
            onAddNew={handleOpenCreate}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </div>
      )}

      {/* Konten Tab 2: Titik & Jalur Evakuasi */}
      {activeTab === "evacuation" && (
        <div className="space-y-6">
          {/* Quick Stats Banner - Ukuran Ramping & Proporsional */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Shelter Terdata
                </p>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {evacuationPoints.length} Titik
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Daya Tampung
                </p>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {totalCapacity.toLocaleString()} Jiwa
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Mountain size={20} />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                  Elevasi Tertinggi
                </p>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {highestElevation} mdpl
                </h3>
              </div>
            </div>
          </div>

          {/* Section Peta Sebaran */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={20} className="text-[#00247D] dark:text-blue-400" />
                  Peta Sebaran Titik Evakuasi Desa Cibenda
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Klik marker pada peta untuk melihat informasi dan menguji link navigasi rute Google Maps.
                </p>
              </div>
            </div>

            <EvacuationOverviewMap
              points={evacuationPoints}
              selectedPointId={highlightedPointId}
              onSelectPoint={(p) => setHighlightedPointId(p.id)}
            />
          </div>

          {/* Section Daftar Kartu Titik Evakuasi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Daftar Titik & Shelter Kesiapsiagaan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kelola informasi lokasi, elevasi tsunami, kapasitas, dan fasilitas per shelter.
                </p>
              </div>
            </div>

            <EvacuationPointCards
              points={evacuationPoints}
              isLoading={evacuationQuery.isLoading}
              onEdit={handleOpenEditEvacuation}
              onDelete={handleOpenDeleteEvacuation}
              onHighlightMap={(point) => {
                setHighlightedPointId(point.id);
                window.scrollTo({ top: 200, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      )}

      {/* Konten Tab 3: Panduan Kesiapsiagaan */}
      {activeTab === "guides" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Modul Panduan Kesiapsiagaan
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Pengelolaan buku saku mitigasi bencana gempa megathrust dan SOP kedaruratan (Roadmap FS-05).
          </p>
        </div>
      )}

      {/* Modal Kontak Darurat */}
      <EmergencyContactFormModal
        isOpen={isFormModalOpen}
        contact={selectedContactForEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedContactForEdit(null);
        }}
        onSubmit={handleFormSubmit}
        isSubmitting={isFormSubmitting}
      />

      <EmergencyContactDeleteModal
        isOpen={isDeleteModalOpen}
        contact={selectedContactForDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedContactForDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Modal Titik Evakuasi */}
      <EvacuationPointFormModal
        isOpen={isEvacuationFormOpen}
        point={selectedEvacuationForEdit}
        onClose={() => {
          setIsEvacuationFormOpen(false);
          setSelectedEvacuationForEdit(null);
        }}
        onSubmit={handleEvacuationFormSubmit}
        isSubmitting={isEvacuationSubmitting}
      />

      <EvacuationPointDeleteModal
        isOpen={isEvacuationDeleteOpen}
        point={selectedEvacuationForDelete}
        onClose={() => {
          setIsEvacuationDeleteOpen(false);
          setSelectedEvacuationForDelete(null);
        }}
        onConfirm={handleEvacuationDeleteConfirm}
        isDeleting={isEvacuationDeleting}
      />
    </div>
  );
}

