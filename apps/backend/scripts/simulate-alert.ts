/**
 * Trigger manual alert untuk demo — menulis ke database via
 * AlertService.saveAlert() (jalur sama persis dengan alert.scheduler.ts),
 * level & deskripsi dihasilkan DecisionEngineService dari mock data
 * gempa/tsunami — bukan teks hardcode — supaya konsisten dengan logic
 * production. Opsional sekalian dispatch push notification (--notify),
 * memanggil NotificationService langsung (bukan lewat HTTP route), jadi
 * TIDAK butuh login/token meski endpoint dispatch aslinya protected.
 *
 * PERINGATAN: menulis ke DATABASE_URL aktif di .env kamu.
 *
 * Cara pakai:
 *   npm run simulate:alert -- aman
 *   npm run simulate:alert -- waspada           (gempa terdeteksi -> YELLOW)
 *   npm run simulate:alert -- siaga              (gempa dirasakan warga -> ORANGE)
 *   npm run simulate:alert -- siaga --tsunami    (tsunami SIAGA -> ORANGE, jalur tsunami)
 *   npm run simulate:alert -- awas --tsunami     (tsunami AWAS -> RED, SATU-SATUNYA jalur RED)
 *   npm run simulate:alert -- siaga --notify     (sekalian kirim push notification)
 *
 * CATATAN: gempa TIDAK PERNAH menghasilkan RED (maksimum ORANGE). "awas"
 * tanpa --tsunami akan ditolak script, bukan diam-diam salah jalur.
 */
import "dotenv/config";
import { AlertService } from "../src/services/alert.service.js";
import { NotificationService } from "../src/services/notification.service.js";
import { DecisionEngineService } from "../src/services/decisionEngine.service.js";
import type { DecisionInput, TsunamiStatusInfo } from "../src/types/alert.types.js";
import type { EarthquakeInfo } from "../src/types/earthquake.types.js";

const EARTHQUAKE_SCENARIOS: Record<string, DecisionInput> = {
  aman: {},
  waspada: {
    earthquake: {
      magnitude: 4.8, depth: "18 km", location: "25 km Tenggara Pangandaran-Jawa Barat",
      coordinates: { latitude: -7.85, longitude: 108.55 }, distanceToVillage: 28, felt: "",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/simulasi-demo.mmi.jpg",
      updatedAt: new Date().toISOString(),
    } satisfies EarthquakeInfo,
  },
  siaga: {
    earthquake: {
      magnitude: 5.4, depth: "12 km", location: "12 km BaratDaya Pangandaran-Jawa Barat",
      coordinates: { latitude: -7.75, longitude: 108.45 }, distanceToVillage: 15,
      felt: "III Cibenda, II-III Parigi, II Pangandaran",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/simulasi-demo.mmi.jpg",
      updatedAt: new Date().toISOString(),
    } satisfies EarthquakeInfo,
  },
};

const TSUNAMI_SCENARIOS: Record<string, DecisionInput> = {
  waspada: { tsunami: { status: "WASPADA", source: "SIGAP (estimasi otomatis, simulasi demo)", description: "Estimasi potensi tsunami level WASPADA berdasarkan data gempa terkini." } satisfies TsunamiStatusInfo },
  siaga: { tsunami: { status: "SIAGA", source: "BMKG (simulasi demo)", description: "BMKG mengeluarkan status SIAGA potensi tsunami di sekitar wilayah Pangandaran. Tetap waspada dan pantau perkembangan resmi melalui bmkg.go.id." } satisfies TsunamiStatusInfo },
  awas: { tsunami: { status: "AWAS", source: "BMKG (simulasi demo)", description: "BMKG mengeluarkan peringatan AWAS potensi tsunami di sekitar wilayah Pangandaran. Pantau informasi terkini di bmkg.go.id dan ikuti arahan resmi petugas setempat." } satisfies TsunamiStatusInfo },
};

async function main() {
  const args = process.argv.slice(2);
  const scenarioArg = args[0];
  const useTsunami = args.includes("--tsunami");
  const shouldNotifyFlag = args.includes("--notify");

  const scenarioMap = useTsunami ? TSUNAMI_SCENARIOS : EARTHQUAKE_SCENARIOS;
  const input = scenarioArg ? scenarioMap[scenarioArg] : undefined;

  if (!scenarioArg || input === undefined) {
    console.error(`Skenario tidak valid untuk mode ${useTsunami ? "tsunami" : "gempa"}.`);
    console.error(`Pilihan: ${Object.keys(scenarioMap).join(", ")}`);
    if (!useTsunami && scenarioArg === "awas") {
      console.error(`\nGempa TIDAK BISA menghasilkan RED (maksimum ORANGE/siaga).`);
      console.error(`Untuk RED, pakai: npm run simulate:alert -- awas --tsunami`);
    }
    process.exit(1);
  }

  const result = DecisionEngineService.evaluate(input);
  const alert = await AlertService.saveAlert(result.level, result.source, result.description);

  console.log(`Skenario "${scenarioArg}"${useTsunami ? " (tsunami)" : " (gempa)"} -> level ${result.level}`);
  console.log(alert);

  if (shouldNotifyFlag) {
    if (!NotificationService.shouldNotify(result.level)) {
      console.log("Level GREEN — notifikasi di-skip (sesuai NotificationService.shouldNotify()).");
    } else {
      const payload = await NotificationService.getLatestPayload();
      if (payload) {
        const dispatchResult = await NotificationService.dispatch(payload, "MANUAL_SIMULATION");
        console.log(`Push notification terkirim ke ${dispatchResult.sent}/${dispatchResult.total} subscriber.`);
      }
    }
  }

  console.log("\nRefresh dashboard/ESP32 untuk melihat hasilnya (device polling ≤15 detik).");
  process.exit(0);
}

main().catch((error) => {
  console.error("Gagal menjalankan simulasi:", error);
  process.exit(1);
});