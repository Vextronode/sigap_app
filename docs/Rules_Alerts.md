# Alert & Broadcast Rules

> Project : SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda)
> Version : 1.2
> Status : Draft

**Changelog v1.1 → v1.2 (implemented in `bmkg.service.ts`, branch `feat/tsunami-live-status`):** status tsunami tidak lagi hardcoded `NORMAL` selamanya. Selama InaTEWS resmi belum bisa diakses lewat API publik (kampus/tim sedang mengurus akses ini secara terpisah), status sekarang **diestimasi otomatis** dari field `Potensi` gempa BMKG terdekat, **dibatasi maksimal WASPADA** — tidak pernah otomatis jadi SIAGA/AWAS, karena `Potensi` cuma flag biner per-gempa, bukan status resmi InaTEWS yang bisa dikonfirmasi/dicabut seiring data gelombang nyata. SIAGA/AWAS tetap hanya bisa masuk lewat override manual. Lihat point 4, point 6 (WASPADA & AWAS), dan `docs/API_Spec.md` point 11 untuk penjelasan lengkap.

**Changelog v1.0 → v1.1 (implemented in `decisionEngine.service.ts`):** severity untuk WASPADA vs SIAGA dulu direncanakan pakai ambang batas magnitudo/radius buatan tim sendiri. Setelah ditinjau ulang, ini diganti dengan **field `Dirasakan` (skala MMI — Modified Mercalli Intensity) resmi dari BMKG** — BMKG sudah menyediakan ukuran "apakah gempa ini dirasakan warga di suatu lokasi" secara resmi, jadi tim tidak perlu menebak skala severity sendiri. Lihat point 4, point 5, point 6, point 7 untuk detail yang sudah disesuaikan.

**Status implementasi saat ini (penting untuk tim device/sirine):** yang sudah berjalan otomatis adalah penentuan level (GREEN/YELLOW/ORANGE/RED) dan penyimpanannya ke database setiap 60 detik. **Broadcast ke Kepala Desa/RT/RW/warga (point 8, point 9) belum diimplementasikan sama sekali** — belum ada kanal WhatsApp/SMS/push notification yang terhubung. Saat ini level hanya tersedia lewat dashboard dan (untuk perangkat) lewat REST polling ke backend. Jangan asumsikan broadcast di point 8/9 sudah aktif.

---

# 1. Tujuan

Dokumen ini mendefinisikan aturan pengambilan keputusan (Decision Rules) yang digunakan SIGAP untuk menentukan status kesiapsiagaan serta mekanisme broadcast berdasarkan informasi resmi dari BMKG.

SIGAP **tidak melakukan prediksi bencana** maupun analisis kebencanaan secara mandiri.

Seluruh keputusan sistem didasarkan pada data resmi BMKG yang kemudian diterjemahkan menjadi mekanisme distribusi informasi bagi masyarakat Desa Cibenda.

---

# 2. Prinsip Dasar

SIGAP berfungsi sebagai:

- Decision Support Dashboard
- Emergency Information Distribution Platform

SIGAP bukan:

- Sistem pendeteksi gempa
- Sistem pendeteksi tsunami
- Sistem Early Warning mandiri

---

# 3. Sumber Data

Seluruh informasi diperoleh dari:

- BMKG
- BMKG Weather API (Prakiraan Cuaca)
- BMKG Auto Gempa API (Gempa Terbaru)
- BMKG / InaTEWS (Peringatan Dini Tsunami)
- Leaflet atau OpenStreetMap (Peta)
- Data Evakuasi Pemerintah Desa Cibenda (akan diintegrasikan pada tahap implementasi)

SIGAP tidak menghasilkan data kebencanaan sendiri.

> Apabila BMKG tidak mengeluarkan informasi resmi, maka SIGAP tidak akan membuat status bencana secara mandiri.

---

# 4. Parameter Decision Engine

SIGAP menggunakan kombinasi beberapa parameter berikut.

## Gempa Bumi

- Jarak episentrum terhadap Desa Cibenda — **filter relevansi** (lihat point 5), gempa di luar radius/umur maksimum tidak pernah sampai ke tahap evaluasi status.
- Waktu kejadian — dipakai untuk filter umur maksimum di point 5 (BMKG hanya menyimpan 15 gempa M5+ nasional terakhir, jadi tanpa filter umur, gempa lama bisa nyangkut berminggu-minggu di daftar seolah baru terjadi).
- **Status Dirasakan (skala MMI resmi BMKG)** — parameter penentu severity (WASPADA vs SIAGA). Lihat point 6.
- Magnitudo — ditampilkan di setiap alert untuk konteks, tapi **tidak lagi dipakai sebagai ambang batas severity sendiri** (lihat catatan v1.1 di atas).
- Potensi tsunami per-gempa (field `Potensi` BMKG) — **sudah dipakai**, tapi hanya untuk estimasi status tsunami itu sendiri (lihat bagian Tsunami di bawah dan point 11 di `docs/API_Spec.md`), **bukan** untuk memicu AWAS. Estimasi ini sengaja dibatasi maksimal WASPADA — RED/AWAS tidak bisa otomatis terpicu dari sini.

## Tsunami

- Status resmi BMKG InaTEWS (NORMAL/WASPADA/SIAGA/AWAS) — **prioritas tertinggi**, dicek sebelum parameter gempa apa pun. Karena InaTEWS belum ada API publik (lihat `docs/API_Spec.md` point 11), status "resmi" ini praktiknya hanya bisa masuk lewat override manual (env `BMKG_TSUNAMI_STATUS`) oleh operator yang punya info resmi dari kanal lain — bukan otomatis dari BMKG.
- Kalau tidak ada override manual, status **diestimasi otomatis** dari field `Potensi` gempa BMKG yang relevan untuk Desa Cibenda (`Potensi === "Berpotensi tsunami"` → WASPADA, selain itu → NORMAL). Estimasi ini **dibatasi maksimal WASPADA** — lihat penjelasan lengkap kenapa di `docs/API_Spec.md` point 11.
- Estimasi tinggi gelombang, status pencabutan peringatan — masih belum tersedia sumber data publiknya, tidak dipakai dalam bentuk apa pun saat ini.

---

# 5. Radius Wilayah

SIGAP menghitung jarak antara koordinat episentrum gempa dan koordinat Desa Cibenda menggunakan koordinat geografis (Latitude & Longitude).

Koordinat referensi:

Desa Cibenda
Latitude : -7.67472
Longitude : 108.55444

Apabila koordinat desa tidak tersedia, sistem dapat menggunakan titik referensi Kabupaten Pangandaran sebagai fallback.

**Radius relevansi (implementasi saat ini):** gempa dianggap relevan untuk Desa Cibenda apabila berjarak ≤150 km dari desa **dan** terjadi dalam 14 hari terakhir (`PANGANDARAN_RADIUS_KM` / `PANGANDARAN_MAX_AGE_DAYS`, keduanya dapat dikonfigurasi lewat environment variable, lihat `earthquake.service.ts`). Filter umur diperlukan karena sumber data BMKG yang dipakai (`gempaterkini.json`) hanya berisi 15 gempa M5+ terakhir se-Indonesia — tanpa filter ini, satu gempa lama bisa tetap muncul seolah baru terjadi saat sedang sepi gempa besar secara nasional.

**Catatan penting — koreksi dari draft v1.0:** sebelumnya dokumen ini mencantumkan 3 kategori radius (Tinggi/Sedang/Rendah) yang secara implisit dipakai sebagai bagian dari penentuan severity. Ini **bertentangan** dengan prinsip yang sudah dinyatakan di paragraf terakhir bagian ini sejak awal — bahwa radius adalah filter relevansi, bukan penentu tingkat bahaya. Implementasi sekarang konsisten dengan prinsip tersebut: radius hanya dipakai sebagai **filter satu tahap** (relevan / tidak relevan) sebelum data gempa sampai ke Decision Engine. Begitu gempa dinyatakan relevan, severity (WASPADA vs SIAGA) ditentukan oleh status Dirasakan (MMI), bukan oleh seberapa dekat jaraknya.

Perhitungan radius digunakan sebagai filter relevansi informasi bagi masyarakat Desa Cibenda, bukan sebagai penentu tingkat bahaya bencana.
---

# 6. Tingkat Status Kesiapsiagaan

## 🟢 AMAN

### Kondisi

- Tidak terdapat peringatan dini tsunami resmi dari BMKG.
- Tidak terdapat kejadian gempa yang memerlukan perhatian khusus berdasarkan informasi resmi BMKG.
- Tidak terdapat kejadian gempa yang berada dalam radius prioritas SIGAP.

### Tindakan Sistem

- Dashboard diperbarui.
- Tidak mengirim broadcast.
- Menampilkan informasi terbaru kepada masyarakat.

---

## 🟡 WASPADA

### Kondisi

Salah satu kondisi berikut terpenuhi:

- BMKG mengeluarkan Status WASPADA Tsunami (resmi lewat override manual, **atau otomatis** dari estimasi `Potensi` gempa terdekat — lihat point 4 & point 11 `docs/API_Spec.md`).
- Terdapat gempa yang relevan untuk Desa Cibenda (lolos filter radius + umur di point 5), **namun BMKG belum melaporkan gempa tersebut dirasakan** di sekitar Desa Cibenda/Kecamatan Parigi/Kabupaten Pangandaran (field `Dirasakan` BMKG kosong atau tidak menyebut wilayah tersebut).

### Tindakan Sistem

- Membuat Alert baru.
- Broadcast kepada:
    - Kepala Desa
    - RT/RW
    - Relawan Desa
- Menunggu validasi dari pihak berwenang.
- Dashboard berubah menjadi status WASPADA.

---

## 🟠 SIAGA

### Kondisi

Salah satu kondisi berikut terpenuhi:

- BMKG mengeluarkan Status SIAGA Tsunami.
- Terdapat gempa yang relevan untuk Desa Cibenda (lolos filter radius + umur di point 5) **dan dilaporkan dirasakan** oleh BMKG di sekitar Desa Cibenda/Kecamatan Parigi/Kabupaten Pangandaran — dicek dari field `Dirasakan` (laporan skala MMI resmi BMKG per lokasi), bukan dari ambang batas magnitudo buatan sendiri.

### Tindakan Sistem

- Broadcast prioritas kepada:
    - Kepala Desa
    - RT/RW
    - Relawan Desa
- Dashboard berubah menjadi SIAGA.
- Sistem menyiapkan broadcast kepada warga apabila status meningkat menjadi AWAS atau setelah validasi pihak berwenang.

---

## 🔴 AWAS

### Kondisi

Salah satu kondisi berikut terpenuhi:

- BMKG mengeluarkan Status AWAS Tsunami.
- BMKG mengeluarkan peringatan resmi yang mengharuskan evakuasi masyarakat.

> Status AWAS hanya dapat berasal dari peringatan resmi BMKG atau keputusan resmi pemerintah yang berwenang.

**Catatan implementasi:** kondisi AWAS di atas hari ini hanya bisa terpicu lewat override manual `BMKG_TSUNAMI_STATUS=AWAS` (point 8.4 di `docs/API_Spec.md`) — misalnya operator yang menerima info resmi InaTEWS dari kanal lain (media, BPBD) dan menginput manual, atau untuk keperluan demo. Field `Potensi` per-gempa ("berpotensi tsunami") **sengaja tidak pernah** dipakai untuk memicu AWAS secara otomatis, walau sekarang sudah dipakai untuk WASPADA (lihat bagian Tsunami di point 4 dan alasan lengkapnya di point 11 `docs/API_Spec.md`) — `Potensi` cuma flag biner otomatis per-gempa, bukan status resmi yang layak dipakai untuk level "evakuasi sekarang".

### Tindakan Sistem

- Broadcast otomatis kepada:
    - Kepala Desa
    - RT/RW
    - Relawan Desa
    - Seluruh Warga
- Dashboard berubah menjadi AWAS.
- Menampilkan jalur evakuasi.
- Menampilkan titik evakuasi.
- Menampilkan kontak darurat.
- Menampilkan instruksi evakuasi.

Status AWAS tidak memerlukan validasi manual karena merupakan keputusan resmi BMKG.

---

# 7. Decision Flow

Data BMKG

↓

SIGAP menerima event baru

↓

Validasi lokasi kejadian

↓

Filter relevansi: radius ≤150 km dari Desa Cibenda DAN umur ≤14 hari

↓ (jika tidak relevan, berhenti di sini → AMAN)

Cek Status Tsunami BMKG (prioritas tertinggi — AWAS/SIAGA/WASPADA/NORMAL)

↓ (jika NORMAL, lanjut ke evaluasi gempa)

Cek field Dirasakan (MMI) — apakah menyebut Cibenda/Parigi/Pangandaran?

↓

Menentukan Status:

🟢 AMAN

↓

🟡 WASPADA

↓

🟠 SIAGA

↓

🔴 AWAS

↓

Menjalankan Broadcast sesuai aturan.

---

# 8. Broadcast Rules

## 🟢 AMAN

Broadcast:

Tidak ada.

---

## 🟡 WASPADA

Broadcast kepada:

- Kepala Desa
- RT/RW
- Relawan Desa

Status:

Menunggu validasi.

---

## 🟠 SIAGA

Broadcast kepada:

- Kepala Desa
- RT/RW
- Relawan Desa

Status:

Prioritas tinggi.

Pihak berwenang dapat:

- Mengubah menjadi AWAS.
- Mengakhiri Alert jika BMKG memberikan pembaruan.
> Semua broadcast yang dikirim SIGAP harus menyertakan sumber informasi resmi BMKG beserta waktu pembaruan data.
---

## 🔴 AWAS

Broadcast otomatis kepada:

- Kepala Desa
- RT/RW
- Relawan Desa
- Seluruh warga yang telah terdaftar pada Sistem Informasi Desa (SID).

Tidak memerlukan validasi manual.

---

# 9. Media Broadcast

MVP

- Dashboard SIGAP

Pengembangan berikutnya

- WhatsApp Broadcast
- SMS Broadcast
- Push Notification Mobile
- Email

---

# 10. Perhitungan Jarak Gempa

SIGAP menghitung jarak antara koordinat episentrum gempa dan koordinat Desa Cibenda menggunakan rumus Haversine.

Input:

- Latitude episentrum
- Longitude episentrum
- Latitude Desa Cibenda
- Longitude Desa Cibenda

Output:

- Jarak dalam kilometer

Perhitungan ini hanya digunakan untuk menentukan relevansi informasi bagi masyarakat Desa Cibenda.

Perhitungan ini bukan metode penentuan tingkat bahaya bencana.

---

# 11. Catatan Penting

SIGAP bukan sistem prediksi bencana, sistem peringatan dini mandiri, maupun sistem penentu tingkat bahaya.

SIGAP hanya mengolah dan mendistribusikan informasi resmi yang diterbitkan BMKG agar dapat diterima oleh pemerintah desa dan masyarakat secara lebih cepat, sederhana, dan terstruktur.

Seluruh keputusan evakuasi tetap mengikuti arahan resmi BMKG, BPBD, BNPB, dan Pemerintah Daerah.

Semua broadcast yang dikirim SIGAP harus menyertakan sumber informasi resmi BMKG beserta waktu pembaruan data.