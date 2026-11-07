# 10. Risks and Open Issues

## 10.1 Keputusan Menunggu Implementasi

| Isu | Keputusan | Dampak Selama Belum Diimplementasikan | Pemilik |
|---|---|---|---|
| Status saat data tidak tersedia | ADR-037 | Sistem menampilkan `GREEN` | Tech Lead |

## 10.2 Isu Terbuka

| Isu | Domain | Dampak | Pemilik |
|---|---|---|---|
| Kontrak perangkat: autentikasi, endpoint, dan interval | IoT | Desain pada `sigap-phase-2/` belum dapat dimulai | Tech Lead |
| Kontrak API SID | Integrasi | Integrasi SID belum dapat dibangun | Tech Lead SIGAP dan SID |
| Hosting production | Deployment | Belum ada lingkungan production | Tim DevOps |
| Fitur ringkasan AI | Produk | Kartu dashboard memakai konten sementara | Tech Lead |

## 10.3 Risiko Teknis

| Risiko | Dampak | Mitigasi Saat Ini |
|---|---|---|
| Belum ada tes otomatis | Regresi pada logika alert tidak terdeteksi otomatis | CI menjalankan lint, typecheck, build, validasi Prisma, dan build image |
| Scheduler, rate limiter, dan cache berada di memori proses | Backend tidak dapat berjalan lebih dari satu replika | Stack berjalan satu replika |
| Ketergantungan pada ketersediaan BMKG | Data gempa dan cuaca dapat tertunda | Retry, timeout, rekaman `earthquake_records`, dan cadangan Open-Meteo |
| Alert pertama pada tabel `alerts` kosong | Hasil evaluasi langsung dianggap duplikat, sehingga alert tidak tersimpan dan notifikasi tidak terkirim | Data contoh pada seed mengisi tabel; `SEED_SAMPLE_DATA=false` membuat tabel kosong |
| Pemantauan scheduler bergantung konfigurasi | Kegagalan scheduler dapat tidak terdeteksi | `SCHEDULER_HEARTBEAT_URL` opsional |
