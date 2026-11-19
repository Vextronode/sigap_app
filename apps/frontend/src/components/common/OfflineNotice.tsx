import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

type OfflineNoticeProps = {
  lastUpdatedAt?: string;
};

export const OfflineNotice = ({ lastUpdatedAt }: OfflineNoticeProps) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  const dataTime = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      })
    : null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200"
    >
      <WifiOff size={14} className="shrink-0" aria-hidden="true" />
      <span>
        {dataTime
          ? `Anda sedang offline. Menampilkan data tersimpan per ${dataTime}, kondisi terkini bisa berbeda.`
          : "Anda sedang offline. Data terbaru belum dapat diambil."}
      </span>
    </div>
  );
};
