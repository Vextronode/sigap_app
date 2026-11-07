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
| Scheduler, rate limiter, dan cache berada di memori proses | Backend tidak dapat berjalan lebih dari satu replika | Stack berjalan satu replika |
| Ketergantungan pada ketersediaan BMKG | Data gempa dan cuaca dapat tertunda | Retry, timeout, rekaman `earthquake_records`, dan cadangan Open-Meteo |
| Pemantauan scheduler bergantung konfigurasi | Kegagalan scheduler dapat tidak terdeteksi | `SCHEDULER_HEARTBEAT_URL` opsional |
