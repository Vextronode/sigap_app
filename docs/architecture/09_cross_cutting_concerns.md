# 9. Cross-Cutting Concerns

## 9.1 Ketahanan Data

| Komponen | Perilaku |
|---|---|
| Data gempa | Memakai rekaman `earthquake_records` saat data BMKG tidak tersedia |
| Cuaca | Menggabungkan BMKG dan Open-Meteo dengan cadangan antarsumber |
| Permintaan eksternal | Timeout dan retry dapat dikonfigurasi |
| Alert yang berlaku | Dihitung langsung dari BMKG saat tabel `alerts` kosong atau gagal dibaca; bernilai `UNKNOWN` bila tidak ada alert aktif dan data BMKG gagal diambil |
| Scheduler | Siklus baru dilewati bila siklus sebelumnya belum selesai |
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
| `/api/public/system-health` | Status BMKG, Open-Meteo, Web Push, SID, dan database untuk dashboard admin |
