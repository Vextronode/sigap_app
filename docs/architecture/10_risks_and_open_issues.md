# 10. Risks and Open Issues

## 10.1 Isu Terbuka

| Isu | Domain | Dampak | Pemilik |
|---|---|---|---|
| Kontrak perangkat: autentikasi, endpoint, interval, dan penanganan `UNKNOWN` pada firmware | IoT | Desain pada `sigap-phase-2/` belum dapat dimulai | Tech Lead |
| Kontrak API SID | Integrasi | Integrasi SID belum dapat dibangun | Tech Lead SIGAP dan SID |
| Hosting production | Deployment | Belum ada lingkungan production | Tim DevOps |
| Fitur ringkasan AI | Produk | Kartu dashboard memakai konten sementara | Tech Lead |

## 10.2 Risiko Teknis

| Risiko | Dampak | Mitigasi Saat Ini |
|---|---|---|
| Tes otomatis baru mencakup Decision Engine, siklus alert, scheduler, dan middleware sesi | Regresi di modul lain dan pada frontend tidak terdeteksi otomatis | CI menjalankan tes backend, lint, typecheck, build, validasi Prisma, validasi OpenAPI terhadap rute backend, pemeriksaan tautan dokumen, dan build image |
| Celah pada dependency development tanpa versi perbaikan yang kompatibel: `minimatch` (ESLint), `glob` dan `deepmerge` (build service worker) | Hanya berpengaruh saat lint dan build | Tidak ikut ke image runtime; Dependabot memeriksa update setiap minggu |
| Scheduler, rate limiter, dan cache berada di memori proses | Backend tidak dapat berjalan lebih dari satu replika | Stack berjalan satu replika |
| Ketergantungan pada ketersediaan BMKG | Data gempa dan cuaca dapat tertunda | Retry, timeout, rekaman `earthquake_records`, dan cadangan Open-Meteo |
| Pemantauan scheduler dari luar server bergantung konfigurasi | Scheduler yang berhenti saat tidak ada admin membuka dashboard dapat tidak terdeteksi | Status scheduler di dashboard admin, banner dihitung langsung dari BMKG saat scheduler tidak sehat, dan `SCHEDULER_HEARTBEAT_URL` opsional dengan peringatan saat start |
