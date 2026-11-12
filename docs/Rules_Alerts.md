# Alert & Broadcast Rules

| Field | Detail |
|---|---|
| Project | SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda) |
| Versi | 2.1 |
| Tanggal | 11 November 2026 |
| Status | Aktif |
| Implementasi | `apps/backend/src/services/decisionEngine.service.ts`, `alertSequence.service.ts`, `alert.service.ts`, `bmkg.service.ts`, `earthquake.service.ts`, `utils/bmkgEarthquake.util.ts`, `scheduler/alert.scheduler.ts` |

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

Ketiga feed gempa disatukan per kejadian (`DateTime` sama). `Dirasakan` diambil dari `autogempa.json` atau `gempadirasakan.json`, `Potensi` dari `gempaterkini.json` atau `autogempa.json`, dan Shakemap dari `autogempa.json`. Item dengan waktu, koordinat, atau magnitudo yang tidak valid tidak dipakai.

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

Gempa dianggap relevan untuk Desa Cibenda bila memenuhi salah satu syarat berikut:

1. Episentrum berada dalam `PANGANDARAN_RADIUS_KM` (default 100 km).
2. Field `Dirasakan` menyebut wilayah Cibenda, Parigi, atau Pangandaran, berapa pun jaraknya. Pencocokan dilakukan per nama wilayah, sehingga "Kecamatan Parigi" terhitung tetapi "Parigi Moutong" tidak.

Kartu gempa Pangandaran menampilkan gempa relevan terbaru yang berumur paling lama `PANGANDARAN_MAX_AGE_DAYS` (default 7 hari). Radius adalah filter relevansi, bukan penentu tingkat bahaya. Jarak dihitung dengan rumus Haversine dari koordinat `VILLAGE_LAT` dan `VILLAGE_LON` (default `-7.6838`, `108.5610`) ke episentrum.

# 5. Status Tsunami

| Kondisi | Status | Sumber yang dicatat |
|---|---|---|
| `BMKG_TSUNAMI_STATUS` terisi | Nilai variabel: `NORMAL`, `WASPADA`, `SIAGA`, atau `AWAS` | `BMKG InaTEWS` |
| Variabel kosong dan salah satu gempa aktif memiliki `Potensi` yang dikenali sebagai berpotensi tsunami | `WASPADA` | `BMKG (estimasi dari data gempa)` |
| Variabel kosong dan data gempa BMKG gagal diambil | `UNKNOWN` | `SIGAP` |
| Variabel kosong selain kondisi di atas | `NORMAL` | `BMKG` |

Estimasi otomatis dibatasi sampai `WASPADA`. Status `SIAGA` dan `AWAS` hanya berasal dari `BMKG_TSUNAMI_STATUS`. Status `UNKNOWN` tidak memengaruhi level.

Waktu pembaruan status tsunami mengikuti data sumbernya: saat backend membaca `BMKG_TSUNAMI_STATUS` untuk status resmi, waktu gempa asal untuk estimasi, dan waktu data gempa BMKG terakhir berhasil diambil untuk `NORMAL` dan `UNKNOWN`.

Hanya teks `Potensi` yang terverifikasi dari feed BMKG yang dikenali:

| Teks `Potensi` | Klasifikasi |
|---|---|
| `Tidak berpotensi tsunami` | `TIDAK_BERPOTENSI` |
| `Gempa ini dirasakan untuk diteruskan pada masyarakat` | `INFORMASI_DIRASAKAN` |
| Teks lain | `TIDAK_DIKENAL`, dicatat ke log |

Teks untuk gempa berpotensi tsunami belum terverifikasi, sehingga estimasi `WASPADA` belum dapat aktif sampai teks tersebut ditambahkan pada `TSUNAMI_POTENTIAL_TEXTS`.

# 6. Penentuan Level

Level tsunami dan level gempa dievaluasi terpisah, lalu level akhir adalah yang tertinggi di antara keduanya.

| Sumber | Kondisi | Level |
|---|---|---|
| Tsunami | Status `AWAS` | `RED` |
| Tsunami | Status `SIAGA` | `ORANGE` |
| Tsunami | Status `WASPADA` | `YELLOW` |
| Gempa | Aktif (berumur paling lama 24 jam) dan `Dirasakan` menyebut Cibenda, Parigi, atau Pangandaran | `ORANGE` |
| Gempa | Aktif | `YELLOW` |
| - | Tidak ada kondisi di atas | `GREEN` |

Level gempa adalah level tertinggi di antara seluruh gempa aktif, sehingga gempa susulan yang lebih kecil tidak menurunkan level selama gempa penentu masih aktif. Deskripsi alert memakai gempa terbesar pada level tersebut.

Bila level keduanya sama, alert memakai sumber dan deskripsi tsunami. Bila level gempa lebih tinggi, alert memakai sumber gempa dan deskripsinya menyertakan deskripsi tsunami.

Magnitudo tidak dipakai sebagai penentu level. Magnitudo hanya dipakai pada aturan notifikasi rentetan gempa (bagian 7).

# 7. Penyimpanan Alert

Scheduler menjalankan evaluasi di dalam proses backend saat `ENABLE_LOCAL_SCHEDULER=true`, dengan interval `ALERT_SCHEDULER_INTERVAL_MS` (default 60 detik). Evaluasi juga dapat dipicu melalui `/api/public/internal/run-scheduler`.

- Hasil `GREEN` tidak disimpan.
- Hasil yang levelnya berasal dari status tsunami resmi disimpan ke tabel `alerts`, kecuali level, sumber, dan deskripsinya sama dengan rekaman terakhir yang berumur paling lama 24 jam.
- Hasil yang levelnya berasal dari estimasi tsunami disimpan bersama waktu gempa asalnya, kecuali level, sumber, dan gempa asalnya sama dengan rekaman terakhir. Revisi data BMKG pada gempa asal yang sama tidak menerbitkan alert baru.
- Hasil yang levelnya berasal dari gempa mengikuti aturan rentetan gempa di bawah.

## 7.1 Rentetan Gempa

Rentetan gempa adalah gempa relevan yang masih aktif. Rentetan berlanjut bila masih ada gempa aktif yang terjadi selama alert rentetan sebelumnya berlaku. Hasil evaluasi dibandingkan dengan rekaman alert terakhir:

| Kondisi | Tindakan | Notifikasi |
|---|---|---|
| Tidak ada alert aktif dan rentetan tidak berlanjut | Alert baru | Ya |
| Level naik | Alert baru | Ya |
| Level turun karena gempa penentu berakhir | Alert baru | Tidak |
| Level sama dan magnitudo terbesar pada level itu paling sedikit 1,0 di atas magnitudo yang terakhir dikirim notifikasi | Alert baru | Ya |
| Level sama selain kondisi di atas | Alert yang berlaku diperpanjang ke kejadian terbaru | Tidak |
| Tidak ada perubahan | Tidak ada | Tidak |

Revisi magnitudo atau penambahan wilayah `Dirasakan` oleh BMKG pada kejadian yang sama diperlakukan sebagai kejadian yang sama. Alert menyimpan waktu kejadian terbaru pada levelnya, magnitudo acuan notifikasi, serta jumlah, awal, dan magnitudo terbesar gempa aktif.

# 8. Alert yang Berlaku

Alert yang berlaku adalah rekaman terbaru pada tabel `alerts`, yang ditampilkan pada dashboard dan diberikan kepada perangkat, dengan ketentuan:

| Kondisi | Hasil |
|---|---|
| Rekaman bersumber `BMKG InaTEWS` dan `BMKG_TSUNAMI_STATUS` sama dengan levelnya (alert aktif) | Ditampilkan apa adanya, tanpa batas umur |
| Rekaman bersumber `BMKG InaTEWS` dan `BMKG_TSUNAMI_STATUS` berubah atau kosong, serta data BMKG terbaca | Ditampilkan sebagai `GREEN` |
| Rekaman lain dengan level selain `GREEN`, paling lama 24 jam sejak waktu kejadian gempa (atau sejak disimpan bila waktu kejadian kosong) (alert aktif) | Ditampilkan apa adanya, beserta batas masa aktifnya |
| Rekaman lain yang melewati batas tersebut, serta data BMKG terbaca | Ditampilkan sebagai `GREEN` |
| Scheduler terlambat, gagal, atau tidak aktif, dan tidak sedang menjalankan siklus | Dihitung langsung dari data BMKG terkini; bila BMKG juga gagal, memakai ketentuan lain pada tabel ini |
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
| `YELLOW`, `ORANGE`, `RED` | Web Push otomatis ke seluruh subscriber saat alert baru tercatat dengan notifikasi menurut bagian 7, tanpa validasi manual |

Penurunan level gempa dan perpanjangan rentetan tidak mengirim notifikasi.

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
| `ALERT_SCHEDULER_INTERVAL_MS` | 60000 | Interval scheduler, minimal 15000. Juga acuan batas terlambat (3 kali interval), termasuk untuk siklus dari pemicu eksternal |

# 12. Batasan

SIGAP bukan sistem prediksi bencana maupun sistem peringatan dini mandiri. Keputusan evakuasi tetap mengikuti arahan resmi BMKG, BPBD, BNPB, dan Pemerintah Daerah.
