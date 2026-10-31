import { useState } from "react";
import { Plus } from "lucide-react";
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
import { parseApiError } from "../utils/errorParser";
import type { EmergencyIconKey } from "../features/emergency-contacts/utils/emergencyIconPresets";
import type {
  EmergencyContactRecord,
  EmergencyContactFeedback,
} from "../types/emergencyContact";

export default function EmergencyContactsAdminPage() {
  useDocumentTitle("Kelola Kontak Darurat - SIGAP Desa Cibenda");

  // React Queries & Mutations untuk Kontak Darurat
  const contactsQuery = useEmergencyContactsList();
  const createMutation = useCreateEmergencyContact();
  const updateMutation = useUpdateEmergencyContact();
  const deleteMutation = useDeleteEmergencyContact();

  // State Modal Form Kontak (Tambah / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedContactForEdit, setSelectedContactForEdit] =
    useState<EmergencyContactRecord | null>(null);

  // State Modal Hapus Kontak
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
      const errorMsg = parseApiError(err);
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
            Kelola Kontak Darurat Desa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola nomor darurat utama dan nomor tambahan instansi untuk warga Desa Cibenda.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00247D] hover:bg-[#001d66] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Kontak</span>
        </button>
      </div>

      {/* Banner Feedback Notifikasi */}
      <EmergencyContactFeedbackBanner
        feedback={feedback}
        onDismiss={() => setFeedback(null)}
      />

      {/* Konten Kontak Darurat */}
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
    </div>
  );
}
