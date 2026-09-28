import { useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuthStore } from "../stores/authStore";
import {
  useUsersList,
  useUserStats,
  useCreateUser,
  useUpdateUser,
  useResetPassword,
  useUnlockUser,
} from "../features/users/hooks/useUserManagement";
import { UserKPIStats } from "../features/users/components/UserKPIStats";
import { UserFilterBar } from "../features/users/components/UserFilterBar";
import { UserTable } from "../features/users/components/UserTable";
import { UserFormModal } from "../features/users/components/UserFormModal";
import { ResetPasswordModal } from "../features/users/components/ResetPasswordModal";
import { ActionFeedbackModal } from "../components/common/ActionFeedbackModal";
import { exportUsersToCSV } from "../features/users/utils/exportUsers";
import type {
  UserRecord,
  CreateUserPayload,
  UpdateUserPayload,
} from "../types/userManagement";

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const apiMsg = err.response?.data?.message;
    if (typeof apiMsg === "string" && apiMsg.trim()) {
      return apiMsg;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
};

export default function UserManagementPage() {
  useDocumentTitle("Manajemen Akun & Role - SIGAP Desa Cibenda");

  const { user: authUser } = useAuthStore();

  // State Filter & Pencarian
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const isAdmin = Boolean(authUser?.roles?.includes("admin"));

  // React Queries & Mutations
  const { data: users = [], isLoading: isUsersLoading } = useUsersList(
    {
      search: search.trim() ? search : undefined,
      role: role !== "ALL" ? role : undefined,
      status: status !== "ALL" ? status : undefined,
    },
    { enabled: isAdmin }
  );

  const { data: stats, isLoading: isStatsLoading } = useUserStats({ enabled: isAdmin });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const resetPasswordMutation = useResetPassword();
  const unlockMutation = useUnlockUser();

  // State Modal Form (Tambah / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // State Modal Reset Password
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserRecord | null>(null);

  // State Notifikasi Pop-up Feedback
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    message: "",
  });

  const showPopup = (
    type: "success" | "error" | "info",
    message: string,
    title?: string
  ) => {
    setFeedback({
      isOpen: true,
      type,
      message,
      title,
    });
  };

  const closePopup = () => {
    setFeedback((prev) => ({ ...prev, isOpen: false }));
  };

  // Handlers Tambah / Edit
  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user: UserRecord) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleCreateSubmit = async (payload: CreateUserPayload) => {
    try {
      await createMutation.mutateAsync(payload);
      showPopup(
        "success",
        `Akun pengguna "${payload.name}" berhasil dibuat dan siap digunakan untuk bertugas.`,
        "Pengguna Berhasil Ditambahkan"
      );
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Gagal menambahkan pengguna.");
      showPopup("error", errorMsg, "Gagal Menambahkan Pengguna");
      throw err;
    }
  };

  const handleUpdateSubmit = async (id: string, payload: UpdateUserPayload) => {
    try {
      await updateMutation.mutateAsync({ id, payload });
      showPopup(
        "success",
        "Perubahan data akun dan peran pengguna berhasil disimpan.",
        "Pembaruan Berhasil"
      );
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Gagal memperbarui pengguna.");
      showPopup("error", errorMsg, "Gagal Memperbarui");
      throw err;
    }
  };

  // Handler Reset Password
  const handleOpenReset = (user: UserRecord) => {
    setSelectedUserForReset(user);
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = async (userId: string, newPassword: string) => {
    try {
      await resetPasswordMutation.mutateAsync({
        id: userId,
        payload: { newPassword },
      });
      showPopup(
        "success",
        "Password baru berhasil disimpan. Sesi aktif pengguna telah digugurkan dan pengguna dapat login dengan password baru.",
        "Reset Password Berhasil"
      );
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Gagal mereset password.");
      showPopup("error", errorMsg, "Gagal Reset Password");
      throw err;
    }
  };

  // Handler Buka Blokir (Unlock)
  const handleUnlock = async (user: UserRecord) => {
    try {
      await unlockMutation.mutateAsync(user.id);
      showPopup(
        "success",
        `Blokir akun "${user.name}" berhasil dibuka. Pengguna dapat login kembali sekarang.`,
        "Buka Blokir Berhasil"
      );
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Gagal membuka blokir akun.");
      showPopup("error", errorMsg, "Gagal Membuka Blokir");
    }
  };

  // Handler Toggle Aktif / Nonaktif
  const handleToggleStatus = async (user: UserRecord) => {
    const nextStatus = !user.isActive;
    const actionLabel = nextStatus ? "mengaktifkan" : "menonaktifkan";

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        payload: { isActive: nextStatus },
      });
      showPopup(
        "success",
        `Akun "${user.name}" berhasil ${nextStatus ? "diaktifkan kembali" : "dinonaktifkan"}.`,
        "Status Akun Diperbarui"
      );
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, `Gagal ${actionLabel} akun.`);
      showPopup("error", errorMsg, "Operasi Ditolak");
    }
  };

  // Handler Ekspor Data ke CSV/Excel
  const handleExport = () => {
    if (users.length === 0) {
      showPopup(
        "info",
        "Tidak ada data akun yang dapat diekspor dengan filter saat ini.",
        "Ekspor Kosong"
      );
      return;
    }
    exportUsersToCSV(users);
    showPopup(
      "success",
      `Sebanyak ${users.length} akun pengguna berhasil diekspor ke file spreadsheet CSV.`,
      "Ekspor Berhasil"
    );
  };

  // Guard khusus role Administrator (Operator dialihkan otomatis ke Dashboard)
  if (authUser?.roles && !authUser.roles.includes("admin")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="w-full space-y-6 pb-14 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Manajemen Akun & Role
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola akun petugas desa, penugasan peran Administrator & Petugas Lapangan, serta pemulihan akses sistem SIGAP.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00247D] hover:bg-[#001d66] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Petugas</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <UserKPIStats stats={stats} isLoading={isStatsLoading} />

      {/* Filter & Search Bar */}
      <UserFilterBar
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={setRole}
        status={status}
        onStatusChange={setStatus}
        onResetFilters={() => {
          setSearch("");
          setRole("ALL");
          setStatus("ALL");
        }}
        onExport={handleExport}
        totalFiltered={users.length}
      />

      {/* User Table */}
      <UserTable
        users={users}
        isLoading={isUsersLoading}
        currentUserId={authUser?.id}
        activeAdminCount={stats?.totalAdmins ?? 1}
        onEdit={handleOpenEdit}
        onResetPassword={handleOpenReset}
        onToggleStatus={handleToggleStatus}
        onUnlock={handleUnlock}
      />

      {/* Modal Form Tambah / Edit */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmitCreate={handleCreateSubmit}
        onSubmitUpdate={handleUpdateSubmit}
        editingUser={editingUser}
        currentUserId={authUser?.id}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Modal Reset Password */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        user={selectedUserForReset}
        onConfirmReset={handleConfirmReset}
        isSubmitting={resetPasswordMutation.isPending}
      />

      {/* Pop-up Action Feedback Modal */}
      <ActionFeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={closePopup}
      />
    </div>
  );
}
