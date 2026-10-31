import { useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  useAlerts,
  useAlertStats,
  useReviewAlert,
} from "../features/alerts/hooks/useAlertVerification";
import { AlertHeader } from "../features/alerts/components/AlertHeader";
import {
  AlertFeedbackBanner,
  type AlertFeedback,
} from "../features/alerts/components/AlertFeedbackBanner";
import { AlertStatCards } from "../features/alerts/components/AlertStatCards";
import { AlertTable } from "../features/alerts/components/AlertTable";
import { AlertReviewModal } from "../features/alerts/components/AlertReviewModal";
import type { AlertItem } from "../types/alert";

export default function AlertVerificationPage() {
  useDocumentTitle("Verifikasi Alert - SIGAP Desa Cibenda");

  // State filter & pagination
  const [page, setPage] = useState<number>(1);
  const [severity, setSeverity] = useState<string>("ALL");
  const [reviewStatus, setReviewStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State modal review
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // State feedback notifikasi
  const [feedback, setFeedback] = useState<AlertFeedback | null>(null);

  // React Queries
  const alertsQuery = useAlerts({
    page,
    limit: 10,
    severity,
    reviewStatus,
  });

  const statsQuery = useAlertStats();
  const reviewMutation = useReviewAlert();

  const handleRefresh = async () => {
    await Promise.all([alertsQuery.refetch(), statsQuery.refetch()]);
  };

  const handleOpenReview = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleCloseReview = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  };

  const handleExecuteReview = async (
    id: string,
    status: "Dikonfirmasi" | "Ditolak" | "Ditindaklanjuti"
  ) => {
    try {
      await reviewMutation.mutateAsync({
        id,
        payload: { reviewStatus: status },
      });
      setFeedback({
        type: "success",
        message: `Alert #${id.slice(0, 8)} berhasil diklasifikasikan sebagai "${status}".`,
      });
      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Gagal memperbarui status verifikasi alert.",
      });
    }
  };

  const handleResetFilters = () => {
    setSeverity("ALL");
    setReviewStatus("ALL");
    setSearchQuery("");
    setPage(1);
  };

  const handleSeverityChange = (newSeverity: string) => {
    setSeverity(newSeverity);
    setPage(1);
  };

  const handleReviewStatusChange = (newStatus: string) => {
    setReviewStatus(newStatus);
    setPage(1);
  };

  const isRefreshing = alertsQuery.isFetching || statsQuery.isFetching;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Clean Header */}
      <AlertHeader
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Banner Feedback Sukses / Gagal */}
      <AlertFeedbackBanner
        feedback={feedback}
        onDismiss={() => setFeedback(null)}
      />

      {/* 4 Stat Cards */}
      <AlertStatCards
        stats={statsQuery.data}
        isLoading={statsQuery.isLoading}
      />

      {/* Tabel Data Alert dengan Toolbar dan Pagination */}
      <AlertTable
        alerts={alertsQuery.data?.data ?? []}
        pagination={alertsQuery.data?.pagination}
        isLoading={alertsQuery.isLoading}
        onPageChange={setPage}
        selectedSeverity={severity}
        onSeverityChange={handleSeverityChange}
        selectedReviewStatus={reviewStatus}
        onReviewStatusChange={handleReviewStatusChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectAlert={handleOpenReview}
        onResetFilters={handleResetFilters}
      />

      {/* Modal Review Klasifikasi */}
      <AlertReviewModal
        isOpen={isModalOpen}
        alert={selectedAlert}
        onClose={handleCloseReview}
        onSubmit={handleExecuteReview}
        isSubmitting={reviewMutation.isPending}
      />
    </div>
  );
}
