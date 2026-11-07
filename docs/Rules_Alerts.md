# Alert & Broadcast Rules

| Field | Detail |
|---|---|
| Project | SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda) |
| Versi | 2.0 |
| Tanggal | 7 November 2026 |
| Status | Aktif |
| Implementasi | `apps/backend/src/services/decisionEngine.service.ts`, `alert.service.ts`, `bmkg.service.ts`, `earthquake.service.ts`, `scheduler/alert.scheduler.ts` |

# 1. Tujuan

Dokumen ini mendefinisikan aturan yang digunakan SIGAP untuk menentukan status kesiapsiagaan dan mendistribusikannya berdasarkan informasi BMKG. SIGAP tidak melakukan prediksi bencana maupun analisis kebencanaan mandiri.

# 2. Sumber Data

| Data | Sumber |
|---|---|
| Gempa terbaru | BMKG `autogempa.json` |
| Daftar gempa | BMKG `gempaterkini.json` dan `gempadirasakan.json` |
| Potensi tsunami | Field `Potensi` pada data gempa BMKG |
| Status tsunami resmi | Variabel `BMKG_TSUNAMI_STATUS`, diisi operator berwenang dari kanal resmi |
| Riwayat gempa | Tabel `earthquake_records` |

Open-Meteo hanya dipakai untuk informasi cuaca dan tidak memengaruhi level kesiapsiagaan.

# 3. Tingkat Status

| Level | Label | Warna |
|---|---|---|
| `GREEN` | Aman | Hijau |
| `YELLOW` | Waspada | Kuning |
| `ORANGE` | Siaga | Oranye |
| `RED` | Awas | Merah |
| `UNKNOWN` | Data Tidak Tersedia | Abu-abu |

`UNKNOWN` hanya muncul pada alert yang berlaku dan tidak disimpan ke database.

# 4. Filter Relevansi Gempa

Gempa dianggap relevan untuk Desa Cibenda bila memenuhi seluruh syarat berikut:

1. Wilayah atau field `Dirasakan` menyebut Pangandaran, atau jaraknya berada dalam `PANGANDARAN_RADIUS_KM` (default 100 km).
2. Lolos radius `PANGANDARAN_RADIUS_KM`.
3. Umurnya paling lama `PANGANDARAN_MAX_AGE_DAYS` (default 7 hari).

Radius adalah filter relevansi, bukan penentu tingkat bahaya. Jarak dihitung dengan rumus Haversine dari koordinat `VILLAGE_LAT` dan `VILLAGE_LON` (default `-7.6838`, `108.5610`) ke episentrum.

# 5. Status Tsunami

| Kondisi | Status | Sumber yang dicatat |
|---|---|---|
| `BMKG_TSUNAMI_STATUS` terisi | Nilai variabel: `NORMAL`, `WASPADA`, `SIAGA`, atau `AWAS` | `BMKG InaTEWS` |
| Variabel kosong dan gempa relevan berumur paling lama 24 jam berpotensi tsunami | `WASPADA` | `BMKG (estimasi dari data gempa)` |
| Variabel kosong selain kondisi di atas | `NORMAL` | `BMKG` |

Estimasi otomatis dibatasi sampai `WASPADA`. Status `SIAGA` dan `AWAS` hanya berasal dari `BMKG_TSUNAMI_STATUS`.

# 6. Penentuan Level

Level tsunami dan level gempa dievaluasi terpisah, lalu level akhir adalah yang tertinggi di antara keduanya.

| Sumber | Kondisi | Level |
|---|---|---|
| Tsunami | Status `AWAS` | `RED` |
| Tsunami | Status `SIAGA` | `ORANGE` |
| Tsunami | Status `WASPADA` | `YELLOW` |
| Gempa | Relevan, berumur paling lama 24 jam, dan `Dirasakan` menyebut Cibenda, Parigi, atau Pangandaran | `ORANGE` |
| Gempa | Relevan dan berumur paling lama 24 jam | `YELLOW` |
| - | Tidak ada kondisi di atas | `GREEN` |

Bila level keduanya sama, alert memakai sumber dan deskripsi tsunami. Bila level gempa lebih tinggi, alert memakai sumber gempa dan deskripsinya menyertakan deskripsi tsunami.

Magnitudo ditampilkan pada deskripsi alert dan tidak dipakai sebagai ambang batas.

# 7. Penyimpanan Alert

Scheduler menjalankan evaluasi di dalam proses backend saat `ENABLE_LOCAL_SCHEDULER=true`, dengan interval `ALERT_SCHEDULER_INTERVAL_MS` (default 60 detik). Evaluasi juga dapat dipicu melalui `/api/public/internal/run-scheduler`.

- Hasil `GREEN` tidak disimpan.
- Hasil selain `GREEN` disimpan ke tabel `alerts`, kecuali level, sumber, dan deskripsinya sama dengan rekaman yang sedang berlaku dan berumur paling lama 24 jam.

# 8. Alert yang Berlaku

Alert yang berlaku adalah rekaman terbaru pada tabel `alerts`, yang ditampilkan pada dashboard dan diberikan kepada perangkat, dengan ketentuan:

| Kondisi | Hasil |
|---|---|
| Rekaman bersumber `BMKG InaTEWS` dan `BMKG_TSUNAMI_STATUS` sama dengan levelnya (alert aktif) | Ditampilkan apa adanya, tanpa batas umur |
| Rekaman bersumber `BMKG InaTEWS` dan `BMKG_TSUNAMI_STATUS` berubah atau kosong, serta data BMKG terbaca | Ditampilkan sebagai `GREEN` |
| Rekaman lain berumur paling lama 24 jam dengan level selain `GREEN` (alert aktif) | Ditampilkan apa adanya |
| Rekaman lain berumur lebih dari 24 jam, serta data BMKG terbaca | Ditampilkan sebagai `GREEN` |
| Tidak ada rekaman atau database gagal dibaca | Dihitung langsung dari data BMKG terkini |
| Tidak ada alert aktif dan data BMKG gagal diambil | `UNKNOWN` |

Hasil disimpan dalam cache memori selama 60 detik.

# 9. Review Alert

Pengguna dengan permission `alert.validate` dapat mencatat tinjauan alert sebagai `Dikonfirmasi`, `Ditolak`, atau `Ditindaklanjuti`. Nilai awalnya adalah `Belum Ditinjau`, yang ditampilkan sebagai `Belum Diverifikasi`. Sistem mencatat peninjau dan waktu peninjauan terakhir.

Status review adalah catatan pasca-kejadian dan tidak memengaruhi level, notifikasi, maupun perangkat.

# 10. Distribusi Notifikasi

| Level | Tindakan |
|---|---|
| `GREEN`, `UNKNOWN` | Tidak ada notifikasi |
| `YELLOW`, `ORANGE`, `RED` | Web Push otomatis ke seluruh subscriber saat alert baru tercatat, tanpa validasi manual |

- Admin dapat mengirim notifikasi manual untuk alert yang berlaku melalui `/api/protected/notifications/dispatch`.
- Isi notifikasi berasal dari alert yang berlaku dan data gempa Pangandaran terkait.
- Subscription yang dibalas 404 atau 410 oleh layanan push dihapus.
- Setiap pengiriman dicatat pada tabel `notification_logs`.
- Selama `BMKG_TSUNAMI_STATUS` terisi selain `NORMAL`, alert baru dan notifikasi terbit setiap 24 jam.

# 11. Parameter Konfigurasi

| Variabel | Default | Fungsi |
|---|---|---|
| `PANGANDARAN_RADIUS_KM` | 100 | Radius relevansi gempa Pangandaran |
| `PANGANDARAN_MAX_AGE_DAYS` | 7 | Umur maksimum gempa relevan |
| `WEST_JAVA_RADIUS_KM` | 350 | Radius tampilan gempa Jawa Barat; kartu ini tidak memiliki batas umur |
| `VILLAGE_LAT`, `VILLAGE_LON` | `-7.6838`, `108.5610` | Koordinat acuan desa |
| `BMKG_TSUNAMI_STATUS` | kosong | Status tsunami resmi |
| `ENABLE_LOCAL_SCHEDULER` | kosong | Mengaktifkan scheduler di dalam proses backend |
| `ALERT_SCHEDULER_INTERVAL_MS` | 60000 | Interval scheduler, minimal 15000 |

# 12. Batasan

SIGAP bukan sistem prediksi bencana maupun sistem peringatan dini mandiri. Keputusan evakuasi tetap mengikuti arahan resmi BMKG, BPBD, BNPB, dan Pemerintah Daerah.
