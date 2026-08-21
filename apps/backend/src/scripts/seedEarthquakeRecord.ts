import "dotenv/config";
import { prisma } from "../config/prisma.js";

async function main() {
  const record = await prisma.earthquakeRecord.upsert({
    where: { eventTime: "2026-08-20T14:31:33.000Z" },
    update: {
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    create: {
      eventTime: "2026-08-20T14:31:33.000Z",
      magnitude: 4.2,
      depth: "17 km",
      location: "Pusat gempa berada di laut 80 km Barat Daya Kab. Pangandaran",
      latitude: -8.09,
      longitude: 107.88,
      distanceToVillage: 88,
      felt: "III Pangandaran, III Kalapanunggal, III Ciamis, III Pameungpeuk",
      potential: "",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
  });
  console.log("SUCCESS PERSISTED SHAKEMAP RECORD:", record);
}

main().catch(console.error).finally(() => prisma.$disconnect());
