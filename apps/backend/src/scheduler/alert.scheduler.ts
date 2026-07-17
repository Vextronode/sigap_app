import { EarthquakeService } from "../services/earthquake.service.js";
import { DecisionEngineService } from "../services/decisionEngine.service.js";
import { AlertService } from "../services/alert.service.js";
import { BmkgService } from "../services/bmkg.service.js";

/**
 * Polling BMKG setiap interval tertentu.
 * Jika ada data gempa baru, hasil Decision Engine akan disimpan ke database.
 */
export function startAlertScheduler(interval = 60_000) {
    console.log(
        `[AlertScheduler] Started. Polling BMKG every ${interval / 1000} seconds.`
    );

    const execute = async () => {
        try {
            // Ambil data gempa dan status tsunami terbaru dari BMKG
            const earthquake = await EarthquakeService.getLatest();
            const tsunamiStatus = await BmkgService.getTsunamiStatus();

            // Jalankan Decision Engine
            const result = DecisionEngineService.evaluate({
                earthquake,
                tsunamiStatus,
            });

            const latestAlert = await AlertService.getCurrentAlert();
            const isDuplicate =
                latestAlert?.level === result.level &&
                latestAlert?.source === result.source &&
                latestAlert?.description === result.description;

            if (isDuplicate) {
                console.log(
                    `[AlertScheduler] Skipped duplicate alert (${result.level})`
                );
                return;
            }

            // Simpan ke database
            await AlertService.saveAlert(
                result.level,
                result.source,
                result.description
            );

            console.log(
                `[AlertScheduler] Alert saved (${result.level}) - ${result.description}`
            );
        } catch (error) {
            console.error("[AlertScheduler] Error:", error);
        }
    };

    // Jalankan sekali saat server pertama kali hidup
    execute();

    // Jalankan berkala
    setInterval(execute, interval);
}
