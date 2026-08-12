import { Bell, BellOff, BellRing, Share } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { usePushNotification } from "../../../hooks/usePushNotification";
import { cn } from "../../../utils/cn";

/**
 * Prompt aktivasi notifikasi push — khusus gempa/tsunami sekitar Desa
 * Cibenda/Pangandaran (isi notifikasinya dibangun backend dari alert +
 * data gempa Pangandaran, lihat notification.service.ts). Dipasang di
 * DashboardPage tepat di bawah CurrentAlertCard.
 */
export const NotificationPrompt = () => {
  const { supported, needsIosInstall, permission, isSubscribed, loading, error, subscribe, unsubscribe } =
    usePushNotification();

  if (!supported) return null;

  if (needsIosInstall) {
    return (
      <Card className="!p-0 overflow-hidden border border-[color:var(--border)] bg-card shadow-sm">
        <div className="flex items-start gap-3 px-5 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-400">
            <Share className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">Aktifkan Notifikasi Gempa &amp; Tsunami</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Di iPhone/iPad, tambahkan SIGAP ke Layar Utama dulu supaya bisa menerima notifikasi — ketuk tombol{" "}
              <Share className="mx-0.5 inline h-3.5 w-3.5" aria-hidden="true" /> Bagikan di Safari, lalu pilih
              &quot;Tambah ke Layar Utama&quot;. Ini batasan dari Apple, bukan dari SIGAP.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (permission === "denied") {
    return (
      <Card className="!p-0 overflow-hidden border border-[color:var(--border)] bg-card shadow-sm">
        <div className="flex items-start gap-3 px-5 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <BellOff className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">Notifikasi Diblokir</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Izin notifikasi untuk SIGAP sudah kamu tolak sebelumnya. Aktifkan ulang lewat pengaturan izin situs
              di browser kamu untuk mulai menerima notifikasi gempa &amp; tsunami sekitar Cibenda-Pangandaran.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="!p-0 overflow-hidden border border-[color:var(--border)] bg-card shadow-sm">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1",
              isSubscribed
                ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400"
                : "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:text-blue-400"
            )}
          >
            {isSubscribed ? (
              <BellRing className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Bell className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              {isSubscribed ? "Notifikasi Aktif" : "Aktifkan Notifikasi Gempa & Tsunami"}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {isSubscribed
                ? "Notifikasi aktif ketika ada gempa atau potensi tsunami di sekitar Desa Cibenda-Pangandaran."
                : "Notifikasi akan aktif ketika ada gempa atau potensi tsunami di sekitar Desa Cibenda-Pangandaran."}
            </p>
            {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </div>

        <button
          type="button"
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={loading}
          className={cn(
            "shrink-0 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-60",
            isSubscribed
              ? "border border-[color:var(--border)] text-muted-foreground hover:bg-muted"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {loading ? "Memproses..." : isSubscribed ? "Matikan" : "Aktifkan"}
        </button>
      </div>
    </Card>
  );
};
