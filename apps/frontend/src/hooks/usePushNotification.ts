import { useCallback, useEffect, useState } from "react";
import { notificationService } from "../services/notificationService";

type PermissionState = "unsupported" | "default" | "denied" | "granted";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

/**
 * `navigator.serviceWorker.ready` cuma resolve kalau ADA service worker aktif
 * yang mengontrol halaman ini. Di `npm run dev` biasa, service worker SENGAJA
 * tidak aktif (lihat `devOptions.enabled` di vite.config.ts — default off
 * supaya tidak ganggu HMR) — jadi promise ini bisa menggantung SELAMANYA
 * kalau tidak dikasih timeout, bikin tombol macet "Memproses..." tanpa
 * pesan apa pun. Timeout ini bukan cuma buat dev — di produksi pun kalau
 * registrasi SW gagal/lambat karena sebab lain, user tetap harus dapat
 * feedback, bukan spinner selamanya.
 */
const withTimeout = <T,>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(timeoutMessage)), ms)),
  ]);

const SERVICE_WORKER_TIMEOUT_MS = 8000;
const SERVICE_WORKER_NOT_READY_MESSAGE =
  "Service worker belum aktif. Kalau kamu sedang jalankan `npm run dev` biasa, ini memang belum aktif secara default — coba `npm run build && npm run preview`, atau jalankan dev dengan `VITE_PWA_DEV=true`.";

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

/** iOS Safari cuma kasih izin Web Push kalau situs sudah "Add to Home Screen" — batasan platform, bukan bug SIGAP. */
const isStandaloneDisplay = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

export const usePushNotification = () => {
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const [permission, setPermission] = useState<PermissionState>(
    supported ? (Notification.permission as PermissionState) : "unsupported"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsIosInstall = isIos() && !isStandaloneDisplay();

  useEffect(() => {
    if (!supported) return;

    // Cek status di background — kalau service worker tidak pernah aktif
    // (lihat catatan withTimeout di atas), diamkan saja, jangan ganggu UI
    // dengan error untuk pengecekan pasif seperti ini.
    withTimeout(navigator.serviceWorker.ready, SERVICE_WORKER_TIMEOUT_MS, SERVICE_WORKER_NOT_READY_MESSAGE)
      .then(async (registration) => {
        const existing = await registration.pushManager.getSubscription();
        setIsSubscribed(!!existing);
      })
      .catch(() => {
        // service worker belum aktif — biarkan isSubscribed tetap false
      });
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported || needsIosInstall) return;

    setLoading(true);
    setError(null);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      if (result !== "granted") return;

      const registration = await withTimeout(
        navigator.serviceWorker.ready,
        SERVICE_WORKER_TIMEOUT_MS,
        SERVICE_WORKER_NOT_READY_MESSAGE
      );
      const publicKey = await notificationService.getVapidPublicKey();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await notificationService.subscribe(subscription.toJSON() as PushSubscriptionJSON);
      setIsSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengaktifkan notifikasi.");
    } finally {
      setLoading(false);
    }
  }, [supported, needsIosInstall]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const registration = await withTimeout(
        navigator.serviceWorker.ready,
        SERVICE_WORKER_TIMEOUT_MS,
        SERVICE_WORKER_NOT_READY_MESSAGE
      );
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await notificationService.unsubscribe(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menonaktifkan notifikasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    supported,
    needsIosInstall,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  };
};
