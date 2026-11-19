import { RefreshCw } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { formatTime } from "../../utils/date";
import { cn } from "../../utils/cn";

type StaleDataNoticeProps = {
  /** Waktu data terakhir berhasil dimuat (ms). Tidak ada nilai = data terkini. */
  since?: number;
  compact?: boolean;
  className?: string;
};

/**
 * TK-07: penanda data yang gagal diperbarui. Saat offline tidak ditampilkan karena
 * OfflineNotice sudah memberi tahu kondisi yang sama untuk seluruh halaman.
 */
export const StaleDataNotice = ({ since, compact = false, className }: StaleDataNoticeProps) => {
  const isOnline = useOnlineStatus();

  if (!since || !isOnline) return null;

  const time = formatTime(new Date(since).toISOString());

  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2 bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200",
        className
      )}
    >
      <RefreshCw size={14} className="shrink-0" aria-hidden="true" />
      <span>
        {compact
          ? `Belum diperbarui · ${time} WIB`
          : `Data belum diperbarui · terakhir ${time} WIB`}
      </span>
    </div>
  );
};
