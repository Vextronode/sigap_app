# Architecture Decision Record - Arsitektur Data & Skema

| | |
|---|---|
| **Document Type** | Architecture Decision Record (ADR) |
| **Domain** | Data & Schema Architecture |
| **Status** | Approved |
| **Version** | 1.0 |
| **Date** | 20 July 2026 |
| **Author** | Tech Lead, SIGAP |
| **Applies To** | `db/schema/`, `db/data-dictionary/` |

---

## ADR-001: Primary Key Menggunakan UUID di Seluruh Tabel

### Latar Belakang Keputusan
SIGAP memiliki route Public yang dapat diakses tanpa autentikasi, termasuk endpoint yang mengekspos identifier resource (mis. `alert_log.id`, `iot_devices.id`) secara langsung ke klien. Skema awal perlu menentukan strategi primary key sebelum tabel apa pun dibuat, karena migrasi strategi ini di kemudian hari berbiaya tinggi.

### Alternatif yang Dipertimbangkan
1. **Auto-increment integer** - pendekatan paling umum dan sederhana, native di PostgreSQL (`SERIAL`/`BIGSERIAL`).
2. **UUID** - identifier acak 128-bit, umum dipakai pada sistem dengan permukaan API publik.
3. **Campuran** - UUID hanya pada tabel yang diekspos ke Public API, integer pada tabel internal admin.

### Keputusan yang Dipilih
UUID (`gen_random_uuid()`, ekstensi `pgcrypto`) diterapkan sebagai primary key di **seluruh tabel**, tanpa kecuali.

### Alasan Pemilihan
- Auto-increment integer bersifat berurutan dan dapat ditebak - pihak luar dapat melakukan enumerasi resource (mis. mencoba `id=1, 2, 3, ...`) untuk memetakan seluruh data melalui route Public tanpa otentikasi.
- Alternatif campuran ditolak karena menambah kompleksitas tanpa manfaat proporsional - menyeragamkan satu strategi di semua tabel lebih mudah dipelihara dan mengurangi risiko human error saat menambah tabel baru di kemudian hari.
- Konsisten dengan prinsip standardisasi lintas sistem program (identifier convention wajib seragam).

### Dampak Terhadap Sistem
- Seluruh foreign key di skema menggunakan tipe `UUID`, bukan `INTEGER`.
- Ukuran index sedikit lebih besar dibanding integer - dampak ini dianggap dapat diterima mengingat skala data SIGAP (satu desa, bukan sistem skala nasional).
- Field `id` tidak dapat digunakan untuk mengurutkan data berdasarkan waktu pembuatan (tidak sekuensial) - kolom `created_at`/`triggered_at`/`recorded_at` wajib digunakan untuk keperluan pengurutan kronologis.

---

## ADR-002: PostgreSQL Sebagai Database Engine

### Latar Belakang Keputusan
SIGAP membutuhkan database relasional untuk menyimpan data terstruktur (pengguna, konten administratif, log lingkungan dan alert) dengan kebutuhan relasi antar-entity yang jelas (foreign key, constraint).

### Alternatif yang Dipertimbangkan
Keputusan ini diwariskan dari versi PRD sebelum sesi perancangan teknis ini dan telah berstatus **Final** di tech stack - alternatif (MySQL, MongoDB, dsb.) tidak dipertimbangkan ulang dalam sesi ini.

### Keputusan yang Dipilih
PostgreSQL.

### Alasan Pemilihan
- Mendukung tipe data dan fitur yang dipakai secara langsung oleh skema SIGAP: `ENUM` native (`status_level`, `device_connectivity`, `siren_trigger_source`), `JSONB` (untuk `evacuation_routes.geometry`), dan `CHECK` constraint kompleks (mis. penegakan `operator_id` wajib terisi hanya pada `trigger_source = remote_aplikasi`).
- Dukungan ekosistem matang untuk kebutuhan hosting sederhana yang sesuai skala program (single village deployment).

### Dampak Terhadap Sistem
- Seluruh sintaks DDL di `db/schema/` menggunakan dialek PostgreSQL secara eksplisit - tidak portable langsung ke engine lain tanpa penyesuaian.
- Penggunaan `ENUM` native berarti penambahan nilai baru ke suatu level (mis. jika status kesiapsiagaan berubah dari 4 menjadi 5 tingkat) memerlukan migrasi skema (`ALTER TYPE`), bukan sekadar perubahan data.

---

## ADR-003: Status Kesiapsiagaan Menggunakan 4 Level

### Latar Belakang Keputusan
Rancangan awal indikator fisik IoT sempat menggunakan 3 level (Hijau/Kuning/Merah), sementara Rule-Based Decision Engine pada PRD sejak awal telah mendefinisikan 4 status (Normal, Waspada, Siaga, Awas). Diskrepansi ini ditemukan saat penyusunan skema data dan perlu diselesaikan sebelum Data Dictionary dikunci.

### Alternatif yang Dipertimbangkan
1. Mempertahankan 3 level pada indikator fisik, mengabaikan status "Siaga" dari Decision Engine.
2. Menyelaraskan indikator fisik dengan 4 status Decision Engine yang sudah ada.

### Keputusan yang Dipilih
4 level: `hijau` (Aman), `kuning` (Waspada), `oranye` (Siaga), `merah` (Awas) - didefinisikan sebagai satu ENUM (`status_level`) yang dipakai konsisten di seluruh domain (`alert_log.severity`, `iot_devices.current_level`, `device_status_log.level_sent`, `siren_action_log.level_at_trigger`).

### Alasan Pemilihan
- Opsi 1 akan menciptakan dua sumber kebenaran yang berbeda untuk status kesiapsiagaan yang sama (Decision Engine 4 level vs indikator fisik 3 level) - berisiko membingungkan operator dan warga, dan mempersulit traceability antara alert digital dan indikator fisik.
- Menyelaraskan ke 4 level adalah perbaikan konsistensi, bukan penambahan scope baru - Decision Engine 4-level sudah ada sejak versi PRD awal.

### Dampak Terhadap Sistem
- Aturan aktivasi sirine (ADR terkait di dokumen Kelompok B - Arsitektur IoT & Sirine) harus didefinisikan eksplisit terhadap 4 level, bukan diasumsikan dari struktur 3 level sebelumnya.
- Representasi visual 4 level pada perangkat indikator fisik bergantung kapasitas hardware (jumlah warna LED yang tersedia) - dicatat sebagai isu terbuka pada dokumentasi IoT, di luar cakupan ADR ini.

---

## ADR-004: Fail-Safe pada Status Konektivitas Perangkat IoT

### Latar Belakang Keputusan
Perangkat IoT (indikator level) dapat kehilangan koneksi ke platform. Tanpa penanganan eksplisit, nilai `current_level` yang tersimpan terakhir (mis. `hijau`) dapat terus ditampilkan oleh perangkat maupun ditampilkan sebagai valid oleh frontend meski data tersebut sudah usang dan tidak lagi mencerminkan kondisi aktual.

### Alternatif yang Dipertimbangkan
1. Membiarkan `current_level` tetap ditampilkan apa adanya saat perangkat offline.
2. Memisahkan status konektivitas (`status`) dari nilai level (`current_level`), dan mewajibkan konsumen data (frontend, perangkat) untuk memperlakukan level sebagai tidak valid ketika status tidak `online`.

### Keputusan yang Dipilih
Opsi 2 - kolom `status` (`online`/`offline`/`degraded`) dan `current_level` dipisah secara eksplisit, dengan aturan wajib: saat `status ≠ online`, `current_level` tidak boleh dianggap valid oleh konsumen data.

### Alasan Pemilihan
- Opsi 1 berisiko menimbulkan kesan keliru bahwa kondisi "aman" padahal data sudah usang - dalam sistem yang menyangkut keselamatan (siaga bencana), kesalahan jenis ini (false sense of safety) lebih berbahaya dibanding kekurangan informasi yang jelas ditandai.
- Pemisahan kolom memungkinkan frontend membedakan "level Hijau terkonfirmasi" dari "level tidak diketahui karena device tidak merespons" tanpa ambiguitas.

### Dampak Terhadap Sistem
- Seluruh konsumen data `iot_devices` (frontend dashboard, dokumentasi API) wajib merujuk kombinasi `(status, last_seen_at)`, bukan `current_level` semata - didokumentasikan eksplisit sebagai komentar pada kolom di skema.
- Menambah kewajiban desain UI: tampilan indikator perlu mode visual terpisah untuk kondisi "tidak diketahui/offline", bukan sekadar menampilkan warna level terakhir.
