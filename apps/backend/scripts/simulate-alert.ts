/**
 * Trigger manual untuk melihat LANGSUNG di dashboard bagaimana tampilan
 * setiap level alert — beda dari automated test (yang cuma pass/fail di
 * terminal, lihat src/**\/*.test.ts). Script ini nulis langsung ke
 * database lokal kamu (BUKAN mock) lewat AlertService.saveAlert() yang
 * sama persis dipakai scheduler asli, jadi hasilnya kelihatan di
 * dashboard begitu kamu refresh.
 *
 * PERINGATAN: ini menulis ke DATABASE_URL yang aktif di .env kamu. Jangan
 * jalankan ini kalau .env sedang menunjuk ke database staging/produksi.
 *
 * Cara pakai:
 *   npm run simulate:alert -- aman
 *   npm run simulate:alert -- waspada
 *   npm run simulate:alert -- siaga
 *   npm run simulate:alert -- awas
 *   npm run simulate:alert -- awas --tsunami
 *     (varian "awas" yang deskripsinya dari status tsunami InaTEWS,
 *      bukan dari gempa — kondisi paling parah yang bisa dihasilkan sistem)
 *
 * Setelah dijalankan, scheduler asli (kalau backend-nya jalan via
 * `npm run dev`) akan tetap polling BMKG tiap 60 detik dan bisa
 * MENIMPA alert simulasi ini kalau kondisi BMKG asli berbeda — matikan
 * dulu `npm run dev` sementara kalau mau alert simulasi ini bertahan
 * lebih lama untuk didemokan.
 */
import "dotenv/config";
import { AlertService } from "../src/services/alert.service.js";
import { AlertLevel } from "../generated/prisma/enums.js";

type Scenario = {
  level: AlertLevel;
  source: string;
  description: string;
};

const SCENARIOS: Record<string, Scenario> = {
  aman: {
    level: AlertLevel.GREEN,
    source: "BMKG",
    description: "Tidak terdapat peringatan resmi BMKG.",
  },
  waspada: {
    level: AlertLevel.YELLOW,
    source: "BMKG",
    description:
      "Gempa M5.3 terdeteksi dalam radius pemantauan Desa Cibenda, namun belum ada laporan dirasakan warga. Tetap pantau informasi resmi BMKG.",
  },
  siaga: {
    level: AlertLevel.ORANGE,
    source: "BMKG",
    description:
      "Gempa M6.5 dirasakan warga di sekitar Desa Cibenda (III Pangandaran, II Cilacap).",
  },
  awas: {
    level: AlertLevel.RED,
    source: "BMKG",
    description:
      "Gempa M7.8 dirasakan warga di sekitar Desa Cibenda (VI Pangandaran, V Cilacap) — simulasi skenario terburuk gempa.",
  },
  "awas-tsunami": {
    level: AlertLevel.RED,
    source: "BMKG InaTEWS",
    description: "BMKG mengeluarkan status AWAS tsunami. Ikuti arahan evakuasi resmi.",
  },
};

const main = async () => {
  const [, , scenarioArg, flag] = process.argv;
  const key =
    scenarioArg === "awas" && flag === "--tsunami" ? "awas-tsunami" : scenarioArg;
  const scenario = key ? SCENARIOS[key] : undefined;

  if (!scenario) {
    console.error(
      `Skenario tidak dikenal: "${scenarioArg ?? ""}".\n` +
        `Pilihan: ${Object.keys(SCENARIOS).filter((k) => k !== "awas-tsunami").join(", ")} (tambahkan --tsunami di belakang "awas" untuk varian status tsunami resmi)`
    );
    process.exit(1);
  }

  const saved = await AlertService.saveAlert(
    scenario.level,
    scenario.source,
    scenario.description
  );

  console.log(`Alert level "${scenario.level}" berhasil disimpan ke database:`);
  console.log(saved);
  console.log("\nRefresh dashboard lokal kamu untuk melihat hasilnya.");
  process.exit(0);
};

main().catch((error) => {
  console.error("Gagal menjalankan simulasi:", error);
  process.exit(1);
});
