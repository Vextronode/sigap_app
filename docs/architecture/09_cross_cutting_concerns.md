# 9. Cross-Cutting Concerns

## 9.1 Ketahanan Data

| Komponen | Perilaku |
|---|---|
| Data gempa | Feed BMKG disatukan per kejadian; item tidak valid tidak dipakai. Gempa aktif 24 jam digabung dengan `earthquake_records`, yang juga dipakai saat data BMKG tidak tersedia |
| Cuaca | Menggabungkan BMKG dan Open-Meteo dengan cadangan antarsumber |
| Permintaan eksternal | Timeout dan retry dapat dikonfigurasi |
| Alert yang berlaku | Dihitung langsung dari BMKG saat tabel `alerts` kosong atau gagal dibaca; bernilai `UNKNOWN` bila tidak ada alert aktif dan data BMKG gagal diambil |
| Status tsunami | Bernilai `UNKNOWN` bila `BMKG_TSUNAMI_STATUS` kosong dan data gempa BMKG gagal diambil |
| Scheduler | Siklus baru dilewati bila siklus sebelumnya belum selesai. Status siklus dicatat di memori; saat scheduler terlambat, gagal, atau tidak aktif, alert yang berlaku dihitung langsung dari BMKG |
| Shutdown | Menghentikan scheduler, menunggu request berjalan, lalu menutup database |

## 9.2 Cache

| Data | Lokasi | Masa Berlaku |
|---|---|---|
| Alert yang berlaku | Memori backend | 60 detik |
| Ringkasan status perangkat | Memori backend | 30 detik |
| Daftar gempa | Memori backend | `EARTHQUAKE_CACHE_TTL_MS`, default 30 detik |
| Kesehatan sistem | Memori backend | 120 detik |
| Respons `/api/public/*` | Service worker | Network first, timeout 5 detik |

## 9.3 Pembaruan Data Frontend

Frontend memakai TanStack Query dengan polling. Alert terkini diperbarui setiap `VITE_ALERT_REFETCH_INTERVAL_MS` (default 60 detik).

## 9.4 Aksesibilitas

Level kesiapsiagaan ditampilkan dengan teks dan ikon, tidak hanya warna. Kartu alert menampilkan waktu pembaruan terakhir.

## 9.5 Kesehatan Layanan

| Endpoint | Fungsi |
|---|---|
| `/api/healthz` | Liveness tanpa akses database |
| `/api/readyz` | Readiness dengan `SELECT 1`, batas 2 detik |
| `/api/public/system-health` | Status data gempa BMKG, prakiraan BMKG dan Open-Meteo, Web Push, SID, database, dan scheduler untuk dashboard admin. Pengecekan jaringan di-cache 120 detik; status scheduler dihitung setiap permintaan |
