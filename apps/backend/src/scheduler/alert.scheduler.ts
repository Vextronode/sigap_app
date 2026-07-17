import { EarthquakeService } from "../services/earthquake.service.js";
import { DecisionEngineService } from "../services/decisionEngine.service.js";
import { AlertService } from "../services/alert.service.js";

let lastProcessedEarthquake: string | null = null;

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
            // Ambil data gempa terbaru dari BMKG
            const earthquake = await EarthquakeService.getLatest();

            // Hindari memproses gempa yang sama berulang kali
            if (earthquake.updatedAt === lastProcessedEarthquake) {
                return;
            }

            lastProcessedEarthquake = earthquake.updatedAt;

            // Jalankan Decision Engine
            const result =
                DecisionEngineService.evaluateFromEarthquake(earthquake);

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