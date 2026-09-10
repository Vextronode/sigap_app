import { useState } from "react";
import { Plus, MapPin, BookOpen } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  useEmergencyContactsList,
  useCreateEmergencyContact,
  useUpdateEmergencyContact,
  useDeleteEmergencyContact,
} from "../features/emergency-contacts/hooks/useEmergencyContactsAdmin";
import { EmergencyContactFeedbackBanner } from "../features/emergency-contacts/components/EmergencyContactFeedbackBanner";
import { CoreContactsSection } from "../features/emergency-contacts/components/sections/CoreContactsSection";
import { AdditionalContactsSection } from "../features/emergency-contacts/components/sections/AdditionalContactsSection";
import { EmergencyContactFormModal } from "../features/emergency-contacts/components/modals/EmergencyContactFormModal";
import { EmergencyContactDeleteModal } from "../features/emergency-contacts/components/modals/EmergencyContactDeleteModal";
import type { EmergencyIconKey } from "../features/emergency-contacts/utils/emergencyIconPresets";
import type {
  EmergencyContactRecord,
  EmergencyContactFeedback,
} from "../types/emergencyContact";

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

  // State Modal Form (Tambah / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedContactForEdit, setSelectedContactForEdit] =
    useState<EmergencyContactRecord | null>(null);

  // State Modal Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContactForDelete, setSelectedContactForDelete] =
    useState<EmergencyContactRecord | null>(null);

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

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

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
      </div>

      {/* Navigasi */}
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
            className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${activeTab === "evacuation"
                ? "border-[#00247D] text-[#00247D] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
          >
            Titik & Jalur Evakuasi
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("guides")}
            className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${activeTab === "guides"
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

      {/* Konten Tab Aktif */}
      {activeTab === "contacts" && (
        <div className="space-y-6">
          {/* Section 1: Direktori Kontak Darurat Inti (Sesuai Screenshot) */}
          <CoreContactsSection
            contacts={contactsQuery.data ?? []}
            isLoading={contactsQuery.isLoading}
            onEdit={handleOpenEdit}
          />

          {/* Section Kontak Darurat Tambahan */}
          <AdditionalContactsSection
            contacts={contactsQuery.data ?? []}
            isLoading={contactsQuery.isLoading}
            onAddNew={handleOpenCreate}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </div>
      )}

      {activeTab === "evacuation" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 flex items-center justify-center mx-auto mb-3">
            <MapPin size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Modul Titik & Jalur Evakuasi
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Pengelolaan peta geospasial shelter dan rute evakuasi tsunami Desa Cibenda (Roadmap FS-04).
          </p>
        </div>
      )}

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

      {/* Modal Form Tambah / Edit */}
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

      {/* Modal Konfirmasi Hapus */}
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
    </div>
  );
}
