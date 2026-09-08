# Dokumentasi Logika Ambang Batas (Threshold) & Sumber Data Sistem SIGAP
> **Sistem Informasi Gawat Darurat & Monitoring Cuaca Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran**
> 
> *Dokumen Acuan Teknis & Pertanggungjawaban Akademik (Untuk Dosen Penguji / Evaluator)*
> *Terakhir Diperbarui: 3 September 2026*

---

## 1. Landasan Geofencing & Koordinat Acuan Wilayah

Seluruh kalkulasi spasial (jarak gempa, cuaca lokal, dan pemantauan risiko) dihitung secara presisi berpatokan pada koordinat pusat **Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran**:

- **Latitude ($\phi_1$):** `-7.6838` (7.6838° LS)
- **Longitude ($\lambda_1$):** `108.5610` (108.5610° BT)

### Rumus Jarak Spasial (Haversine Formula)
Untuk menghitung jarak antara titik pusat gempa BMKG $(\phi_2, \lambda_2)$ dengan Desa Cibenda $(\phi_1, \lambda_1)$, sistem menggunakan rumus **Haversine (Great-Circle Distance)**:

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1) \cdot \cos(\phi_2) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$c = 2 \cdot \arctan2\left(\sqrt{a}, \sqrt{1-a}\right)$$

$$d = R \cdot c$$

di mana $R = 6371\text{ km}$ (Jari-jari rata-rata bumi).

---

## 2. Logika Decision Engine & Ambang Batas Status Kesiapsiagaan (Banner Alert)

Status kesiapsiagaan pada banner utama dashboard ditentukan secara otomatis oleh `DecisionEngineService` melalui hierarki prioritas keselamatan berikut:

```
                  ┌──────────────────────────────────────────┐
                  │ Data Gempa & Tsunami Masuk dari Scheduler │
                  └────────────────────┬─────────────────────┘
                                       │
                         Apakah Tsunami != NORMAL?
                                 ┌─────┴─────┐
                                 │           │
                              (YA)          (TIDAK)
                                 │           │
                        Priority 1:          Apakah Gempa <= 24 Jam?
                     Status Tsunami          ┌─────┴─────┐
                  (AWAS / SIAGA / WASPADA)   │           │
                                          (YA)          (TIDAK)
                                             │           │
                                   Apakah MMI Dirasakan?  Status AMAN (GREEN)
                                     ┌───────┴───────┐   (Alert Expired)
                                  (YA)              (TIDAK)
                                   │                   │
                            Status SIAGA         Status WASPADA
                              (ORANGE)              (YELLOW)
```

### Ambang Batas (Threshold) Level Alert:

| Level Alert | Kode Warna | Syarat & Ambang Batas (Threshold) | Sumber Data Utama |
| :--- | :--- | :--- | :--- |
| **`GREEN` (Aman)** | Hijau (`#22c55e`) | Tidak ada ancaman tsunami **DAN** tidak ada gempa bumi berdampak dalam window $\le 24\text{ Jam}$. | BMKG & Decision Engine |
| **`YELLOW` (Waspada)** | Kuning (`#ffc642`) | Gempa berusia $\le 24\text{ Jam}$ terdeteksi dalam radius pemantauan ($\le 100\text{ km}$ dari Desa Cibenda), namun **belum ada laporan MMI dirasakan warga**. | BMKG (`gempaterkini` / `gempadirasakan`) |
| **`ORANGE` (Siaga)** | Oranye (`#f97316`) | Gempa berusia $\le 24\text{ Jam}$ dengan skala intensitas MMI **resmi dirasakan warga** di sekitar Desa Cibenda (kata kunci: `"Pangandaran"`, `"Parigi"`, `"Cibenda"` pada field `Dirasakan`). | BMKG (`gempadirasakan`) |
| **`RED` (Awas)** | Merah (`#dc2626`) | Peringatan Dini Tsunami Resmi InaTEWS / BMKG berstatus **AWAS**. | InaTEWS / Override Darurat |

### Evolusi Logika Severity (MMI vs Ambang Batas Magnitudo/Kedalaman):
- **Pendekatan Lama (Draft v1.0):** Dulu sempat direncanakan ambang batas tebakan magnitudo & kedalaman buatan sendiri (misal $M > 5.0$ dan kedalaman $< 75\text{ km}$ diubah jadi SIAGA).
- **Pendekatan Resmi Terbaru (v1.1 & v1.2):** Setelah ditinjau ulang secara ilmiah, SIGAP **beralih penuh menggunakan Skala MMI (Modified Mercalli Intensity) resmi BMKG** dari field `Dirasakan`. 
- **Alasan Ilmiah:** BMKG sudah menyediakan laporan MMI guncangan fisik nyata per-lokasi. Gempa $M 5.2$ yang sangat dalam ($150\text{ km}$) sering kali tidak dirasakan sama sekali di darat, sedangkan gempa $M 4.2$ yang dangkal ($10\text{ km}$) langsung terasa kuat guncangannya di Pangandaran.
- **Tampilan UI:** Magnitudo dan Kedalaman tetap **ditampilkan 100% utuh** pada card gempa sebagai konteks informasi warga, tetapi **penentu severity (WASPADA vs SIAGA)** berpatokan pada MMI resmi BMKG.

### Ambang Batas Umur Aktif Alert (Alert Expiry Threshold = 24 Jam)
- **Angka Threshold:** $24\text{ Jam}$ (`24 * 60 * 60 * 1000` ms).
- **Alasan Ilmiah:** Menurut protokol kesiapsiagaan bencana, fase tanggap darurat utama shockwave gempa bumi lokal bertahan pada kurun waktu 24 jam pertama. Jika telah lewat dari 24 jam tanpa ada kejadian gempa susulan berdampak, status kesiapsiagaan otomatis kadaluarsa dan kembali ke status **`GREEN` (AMAN)**.

---

## 3. Fitur Gempa Bumi & Pemetaan 3 Card Regional

Sistem memisahkan monitoring gempa bumi menjadi 3 tingkatan visual untuk memberikan hierarki informasi yang intuitif bagi warga:

### A. Card Gempa Pangandaran (Kesiapsiagaan Lokal)
- **Sumber Data BMKG:** Kombinasi `gempadirasakan.json` dan `gempaterkini.json` (`fetchCombinedList()`).
- **Filter Spasial (Radius Threshold):** Menyebut nama `"Pangandaran"` **ATAU** Jarak Haversine $\le 100\text{ KM}$ dari Desa Cibenda (dapat dikonfigurasi via env `PANGANDARAN_RADIUS_KM` antara 100 - 150 KM).
- **Filter Temporal (Umur Maksimum Threshold):** **7 Hari (1 Minggu)** (`PANGANDARAN_MAX_AGE_DAYS = 7`).
- **Persistensi Database ShakeMap (`earthquake_records` di Neon Postgres):** BMKG hanya menyediakan URL ShakeMap MMI pada gempa nasional 1 paling baru di `autogempa.json`. Jika terjadi gempa baru di daerah lain, backend SIGAP secara otomatis menyimpan URL ShakeMap Pangandaran ke PostgreSQL Cloud agar gambar peta guncangan **tampil permanen 100% dan tidak pernah hilang**.

### B. Card Gempa Jawa Barat (Kesiapsiagaan Regional)
- **Sumber Data BMKG:** `gempaterkini.json` + `gempadirasakan.json`.
- **Filter Spasial (Radius Threshold):** Jarak Haversine $\le 350\text{ KM}$ dari Desa Cibenda (melingkupi seluruh batas geografi Jawa Barat).
- **Filter Temporal (Umur Maksimum Threshold):** **7 Hari (1 Minggu)** (`WEST_JAVA_MAX_AGE_DAYS = 7`).

#### 💡 Kasus Gempa Cianjur (Jarak 182 KM):
- **Kenapa Gempa Cianjur (182 KM) TIDAK masuk ke Card Pangandaran?**
  Karena jarak Cianjur ke Desa Cibenda ($182\text{ KM}$) melebihi radius batas lokal Pangandaran ($100\text{ KM}$), sehingga Card Pangandaran dengan tepat menyaringnya dan menampilkan *"Kondisi Wilayah Aman / Data Belum Tersedia"*.
- **Kenapa Gempa Cianjur MASUK ke Card Jawa Barat?**
  Karena Cianjur ($182\text{ KM}$) masih berada di dalam radius batas regional Jawa Barat ($\le 350\text{ KM}$), sehingga Card Jawa Barat secara tepat menampilkan informasi gempa Cianjur tersebut!

### C. Card Gempa Indonesia (Kesiapsiagaan Nasional)
- **Sumber Data BMKG:** `autogempa.json` (1 data gempa nasional terbaru paling update dari BMKG).

---

## 4. Fitur Tsunami & Alasan Logika Pengalihan

- **Public Endpoint:** `GET /api/public/tsunami/status`
- **Sumber Data Estimasi:** Diestimasi secara otomatis dari field `Potensi` pada data gempa Pangandaran terdekat (`getPangandaran()`).
- **Ambang Batas Keamanan (Safety Constraint):** Estimasi otomatis **dibatasi maksimal level WASPADA**. Sistem tidak pernah secara otomatis menaikkan status menjadi SIAGA/AWAS tanpa verifikasi gelombang laut nyata.
- **Mode Override Darurat:** Variabel `BMKG_TSUNAMI_STATUS` di env var tersedia untuk operator darurat jika ingin melakukan override manual 4 level penuh (`NORMAL`, `WASPADA`, `SIAGA`, `AWAS`).

### Alasan Mengapa Tidak Menggunakan Direct Private API InaTEWS:
1. **Lisensi Akses Terbatas:** API InaTEWS resmi milik BMKG merupakan infrastruktur API closed-access yang membutuhkan perjanjian MoU resmi antar-lembaga/pemerintah daerah.
2. **Keandalan Sistem:** Dengan menggunakan **Estimasi Otomatis Berbasis Field Potensi BMKG**, aplikasi SIGAP dapat menyajikan status tsunami secara independen, real-time, jujur (`source: "BMKG (estimasi dari data gempa)"`).

---

## 5. Fitur Monitoring Cuaca (Integrasi Open-Meteo & BMKG)

Sistem menggunakan **Open-Meteo API (`open-meteo.com`)** untuk cuaca real-time & prakiraan harian, sedangkan **BMKG** tetap dipakai untuk data gempa & tsunami.

### Alasan Memilih Open-Meteo API:
1. **Frekuensi Update:** BMKG Public API hanya memperbarui data cuaca **2x sehari (07:00 & 19:00 WIB)**. Open-Meteo memperbarui data **setiap jam (hourly)** berdasarkan Numerical Weather Prediction (NWP) model ICON & ECMWF resolusi tinggi.
2. **Presisi Koordinat:** Dihitung langsung untuk titik koordinat Desa Cibenda (`LAT -7.6838, LON 108.5610`).
3. **Gratis & Tanpa Key:** Memiliki rate limit tinggi (10.000 req/hari) tanpa biaya.

### Logika Persentase Probabilitas Hujan (`precipitation_probability_mean`):
- **Angka Threshold:** Menggunakan rata-rata harian **`precipitation_probability_mean`**, **BUKAN `max`**.
- **Alasan:** Parameter `max` mengambil lonjakan puncak 15-menit di tengah malam (misal 92% jam 04:00 subuh). Dengan `mean`, persentase yang tampil di SIGAP (Rabu 46%, Kamis 39%, Jumat 29%) **100% cocok dengan BMKG & Google Weather**.

### Logika Ikon Dinamis Siang vs Malam:
- **Deteksi Waktu:** Jam lokal `>= 18:00 WIB` atau `< 06:00 WIB` dikategorikan sebagai **Malam**.
- **Ikon Malam:** Kondisi Cerah = Bulan Sabit (`BsMoon`), Cerah Berawan/Berawan = Bulan + Awan (`BsCloudMoon`) dengan warna *soft moonlight* (`#60a5fa`).
- **Ikon Siang:** Matahari (`Sun`), Awan + Matahari (`CloudSun`) dengan warna amber emas (`#f59e0b`).

---

## 6. Arsitektur Push Notification Real-Time (Web Push VAPID + FCM)

Sistem notifikasi SIGAP bekerja secara real-time langsung ke perangkat warga tanpa perantara SID.

```
┌─────────────────┐      1. Trigger (1 Menit)      ┌──────────────────┐
│  cron-job.org   │ ─────────────────────────────> │  Backend SIGAP   │
└─────────────────┘                                └────────┬─────────┘
                                                            │
                                                   2. Evaluasi Alert
                                                   (YELLOW/ORANGE/RED)
                                                            │
                                                            v
┌─────────────────┐     4. Dispatch Notification   ┌──────────────────┐
│  HP Warga (PWA) │ <───────────────────────────── │  Google FCM /    │
│  (sw.js Getar)  │        (VAPID Protocol)        │  Apple APNs      │
└─────────────────┘                                └──────────────────┘
```

### Arsitektur & Infrastruktur:
- **Protokol:** Standard W3C Web Push Protocol (**VAPID / RFC 8292**).
- **Infrastruktur Server Push:** Menggunakan **Google FCM (`fcm.googleapis.com`)** untuk browser Chrome/Android dan **Apple APNs** untuk Safari/iOS.
- **Syarat Warga Menerima Notifikasi:**
  1. Warga membuka / menginstal PWA SIGAP.
  2. Warga menekan tombol **"Aktifkan Notifikasi"** (`Notification.requestPermission()`).
  3. Browser mengirimkan token `PushSubscription` ke backend (`POST /api/public/notifications/subscribe`).

### Trigger Otomatis 24/7:
- Cron eksternal (**cron-job.org**) memicu `POST /api/public/internal/run-scheduler` setiap **1 menit**.
- Jika terdeteksi alert baru non-duplikat berlevel `YELLOW`, `ORANGE`, atau `RED`, backend **otomatis mengirim notifikasi Web Push** ke seluruh subscriber DB dan mencatat log riwayatnya ke tabel `notification_logs`.

### Diferensiasi Pola Getar (Vibrate Pattern) di Service Worker (`sw.js`):
| Level Alert | Pola Getar (`vibrate` pattern) | Karakteristik |
| :--- | :--- | :--- |
| **`YELLOW` (Waspada)** | `[200]` | 1 kali getar pendek (200ms) |
| **`ORANGE` (Siaga)** | `[200, 100, 200]` | 2 kali getar medium |
| **`RED` (Awas)** | `[300, 100, 300, 100, 300]` | 3 kali getar panjang darurat |

- **`requireInteraction: true`:** Notifikasi wajib tetap menggantung di tray HP warga sampai di-tap/dismiss manual (tidak hilang sendiri).
- **`renotify: true` + `tag: "sigap-alert"`:** Jika level alert naik (misal dari WASPADA ke SIAGA), HP akan bergetar ulang secara tegas.

---

## 7. Fitur Jalur Evakuasi, Peta, & Kontak Darurat

- **Peta Evakuasi Desa Cibenda:** Menggunakan peta spasial resmi Desa Cibenda (`peta-evakuasi.webp`) yang memvisualisasikan rute evakuasi dari area rawan pesisir menuju titik kumpul aman di area dataran tinggi Desa Cibenda.
- **Direct Click-to-Call Kontak Darurat:** Seluruh daftar nomor kontak darurat diintegrasikan menggunakan protokol `href="tel:<nomor>"` sehingga warga di HP/PWA dapat menelepon bantuan darurat hanya dengan 1 kali ketukan layar.

---

## 8. Ringkasan Parameter & Angka Threshold Utama

| Komponen Fitur | Parameter / Angka Threshold | Keterangan & Landasan Ilmiah |
| :--- | :--- | :--- |
| **Koordinat Desa Cibenda** | `LAT -7.6838`, `LON 108.5610` | Titik pusat acuan kalkulasi geofencing spasial. |
| **Radius Gempa Pangandaran** | $\le 100\text{ KM}$ (default, configurable $100 - 150\text{ KM}$) | Batas radius dampak langsung ke Desa Cibenda. |
| **Radius Gempa Jawa Barat** | $\le 350\text{ KM}$ | Batas radius kesiapsiagaan regional Jawa Barat. |
| **Masa Aktif Status Alert** | $24\text{ Jam}$ (1 Hari) | Status otomatis kembali ke GREEN (AMAN) jika $>24\text{ jam}$. |
| **Umur Max Card Gempa** | $7\text{ Hari}$ (1 Minggu) | Batas gempa yang relevan ditampilkan di dashboard. |
| **Device Offline Threshold** | $20\text{ Detik}$ | Threshold status ESP32 Siren (2x heartbeat gagal). |
| **Probabilitas Hujan Cuaca** | `precipitation_probability_mean` | Rata-rata harian realistis (bukan lonjakan max 15 menit). |
| **Siklus Polling Scheduler** | $1\text{ Menit}$ (60 Detik) | Pemicu cron-job.org 24/7 ke Vercel Serverless. |
