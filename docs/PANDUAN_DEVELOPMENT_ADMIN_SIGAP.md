# PANDUAN PENGEMBANGAN ADMIN PANEL SIGAP (TAHAP 2)
> **Pedoman Arsitektur, Harmonisasi Desain Stitch/Figma, dan Strategi Komponen Tim**  
> *Sistem Informasi Gawat Darurat & Monitoring Cuaca Desa Cibenda, Kabupaten Pangandaran*

---

## 📌 1. Tujuan Dokumen

Dokumen ini adalah **Single Source of Truth (SSOT)** resmi bagi seluruh anggota tim pengembang dan asisten AI (seperti Antigravity, Claude, Cursor, Copilot, ChatGPT, dll.). 

Tujuannya adalah menyatukan pemahaman teknis agar:
1. **Tidak ada duplikasi komponen** atau pembuatan elemen UI baru dari nol untuk fitur yang sudah ada di dashboard warga.
2. Desain dari **Google Stitch / Figma** diposisikan secara tepat sebagai **Wireframe / Layout Blueprint**, bukan patokan aset kode mentah.
3. Seluruh logika bisnis mengikuti acuan resmi Ketua Tim di folder [`docs/sigap-phase-2/`](./sigap-phase-2/).

---

## 📁 2. Lokasi Aset Desain di Repositori Proyek

Folder desain admin kini telah dimasukkan ke dalam repositori di root proyek:  
👉 **`SIGAP Desain Admin/`** (relatif terhadap root repositori).

Dengan meletakkan folder ini di dalam repositori dan di-push ke GitHub, seluruh anggota tim dan AI di mesin masing-masing akan memiliki path relatif yang seragam tanpa bergantung pada path lokal pengguna tertentu.

### 🖼️ Daftar File Desain yang Tersedia:
1. `SIGAP Desain Admin/Halaman Login Admin (SIGAP).png`
2. `SIGAP Desain Admin/Dashboard Ringkasan Admin (SIGAP).png`
3. `SIGAP Desain Admin/Pusat Kontrol Sirine & IoT (SIGAP).png`
4. `SIGAP Desain Admin/Verifikasi & Riwayat Alert (SIGAP).png`
5. `SIGAP Desain Admin/Kelola Kesiapsiagaan Desa (SIGAP).png`
6. `SIGAP Desain Admin/Log Notifikasi & Integrasi SID (SIGAP).png`
7. `SIGAP Desain Admin/Manajemen Akun & Role (SIGAP).png`
8. `SIGAP Desain Admin/Manajemen Akun & Role (SIGAP) - Tampilan Penuh.png`

---

## ⚖️ 3. Prinsip Emas: "Reuse-First, Stitch as Wireframe"

Berdasarkan arahan resmi Ketua Tim di [docs/sigap-phase-2/11_dashboard_admin.md (FS-11)](./sigap-phase-2/11_dashboard_admin.md):

> *"Halaman pertama admin setelah login (Dashboard Admin) sebagian besar **identik dengan dashboard publik** (monitoring lingkungan & kesiapsiagaan), ditambah dua section khusus admin di bawahnya untuk kondisi operasional sistem. Menggunakan komponen/data yang sama persis dengan dashboard publik, tidak ada logika ganda."*

### ❌ Kesalahan yang Harus Dihindari:
* **JANGAN** membuat card cuaca baru (seperti *"Cuaca Lokal 24°C"* di mockup Stitch) menggantikan `<WeatherSection />` yang sudah ada.
* **JANGAN** membuat card seismik baru menggantikan `<EarthquakeCard />` dan `<TsunamiCard />` yang sudah terhubung rapi ke API BMKG dan ShakeMap Postgres.
* **JANGAN** mengganti [`Sidebar.tsx`](../apps/frontend/src/layout/Sidebar.tsx) dengan sidebar baru. Sidebar admin harus memakai basis yang sama (Logo Pangandaran di atas dan status pill koneksi alat di bawah).

### ✅ Yang Benar (Strategi Harmonisasi):
* **Dashboard Publik Warga:** Menampilkan monitoring lingkungan (Cuaca, Gempa, Tsunami, Alert Banner) + Informasi Kesiapsiagaan Warga (Peta Evakuasi, Kontak Darurat, Panduan).
* **Dashboard Admin:** Menampilkan **Dashboard Warga + Panel Kontrol Admin** (Status Hardware IoT Sirine, Monitor Konektivitas BMKG/SID, dan Navigasi Menu Admin).
* **Desain Stitch / Figma:** Diambil **ide tata letaknya (wireframe)** untuk halaman-halaman yang memang benar-benar baru (seperti form login, modal konfirmasi sirine, tabel verifikasi alert, dan log integrasi SID).

---

## 🗺️ 4. Matriks Pemetaan Layar & Strategi Komponen

Berikut panduan implementasi konkret per halaman untuk frontend dan backend:

| Halaman & Route | Dokumen Acuan FS | File Desain Acuan (`SIGAP Desain Admin/`) | Komponen Eksisting (REUSE) | Komponen Baru yang Dibuat | Aturan Logika Kunci |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Login Admin**<br>`/admin/login` | [`01_login_sesi.md`](./sigap-phase-2/01_login_sesi.md)<br>(FS-01) | `Halaman Login Admin (SIGAP).png` | Logo Lambang Pangandaran (`assets/image/lambang-kabupaten-pangandaran.webp`) | Card form login, rate-limit state banner | Rate limit: maks 5x gagal dalam 15 menit $\rightarrow$ akun terkunci. Tombol kembali ke portal warga. |
| **Dashboard Admin**<br>`/admin/dashboard` | [`11_dashboard_admin.md`](./sigap-phase-2/11_dashboard_admin.md)<br>(FS-11) | `Dashboard Ringkasan Admin (SIGAP).png` | `<CurrentAlertCard />`<br>`<WeatherSection />`<br>`<EarthQuakeSection />`<br>`<TsunamiCard />`<br>`<Sidebar />` | `<IoTDeviceControlSection />`<br>`<SystemConnectivityMonitor />`<br>`<UserProfileRoleBadge />` (Topbar) | Section monitoring bencana 100% identik dengan publik. Section bawah menampilkan status IoT dan latensi server. |
| **Pusat Kontrol Sirine**<br>`/admin/devices` | [`06_manajemen_perangkat_iot.md`](./sigap-phase-2/06_manajemen_perangkat_iot.md) s/d [`09_trigger_sirine_remote.md`](./sigap-phase-2/09_trigger_sirine_remote.md)<br>(FS-06, 07, 08, 09) | `Pusat Kontrol Sirine & IoT (SIGAP).png` | Basis style card & status dot dari `global.css` | Card ESP32 3-LED visualizer, tombol trigger sirine, modal konfirmasi 2-langkah, tabel log heartbeat & aktivasi | Sirine terkunci saat level Hijau. Hanya aktif di Kuning/Merah. Level Merah wajib konfirmasi ganda sebelum trigger. Heartbeat: 10s, offline threshold: 20s. |
| **Verifikasi Alert**<br>`/admin/alerts` | [`02_verifikasi_validasi_alert.md`](./sigap-phase-2/02_verifikasi_validasi_alert.md)<br>(FS-02) | `Verifikasi & Riwayat Alert (SIGAP).png` | Status badge colors (Hijau/Kuning/Oranye/Merah) | 4 Stat Metric Cards (Total, Dikonfirmasi, Ditolak, Ditindaklanjuti), Data Table, Modal Tinjau Alert | Verifikasi admin murni administratif (arsip/laporan pasca-kejadian), **TIDAK memblokir** pengiriman alert realtime & push notification warga. |
| **Kesiapsiagaan Desa**<br>`/admin/kesiapsiagaan` | [`03_kelola_kontak_darurat.md`](./sigap-phase-2/03_kelola_kontak_darurat.md) s/d [`05_kelola_panduan_kesiapsiagaan.md`](./sigap-phase-2/05_kelola_panduan_kesiapsiagaan.md)<br>(FS-03, 04, 05) | `Kelola Kesiapsiagaan Desa (SIGAP).png` | `<EmergencyContacts />`<br>`<EvacuationMap />`<br>`<PreparednessGuide />` | Tab navigation, Form CRUD kontak darurat, Leaflet Map Pin-Drop picker, Form CRUD panduan | **6 Kontak Inti** (Ambulans, Damkar, Polsek, Puskesmas, BPBD, Kantor Desa) dilindungi (`is_core = true`) $\rightarrow$ tidak bisa dihapus, hanya bisa edit nomor. |
| **Log Notifikasi & SID**<br>`/admin/logs` | [`12_monitoring_integrasi_sid.md`](./sigap-phase-2/12_monitoring_integrasi_sid.md)<br>(FS-12) & Proposal SID | `Log Notifikasi & Integrasi SID (SIGAP).png` | Style modular grid mirip `WeatherSection.tsx` | 3 Metric Summary Cards (Web Push, SID Gateway, Last Alert), Filter Tabs, Tabel Log Audit | Menampilkan log pengiriman Web Push SIGAP + gateway SID (`POST /api/integrations/sigap/notifications`). |
| **Manajemen Pengguna**<br>`/admin/users` | [`10_manajemen_akun_role.md`](./sigap-phase-2/10_manajemen_akun_role.md)<br>(FS-10) | `Manajemen Akun & Role (SIGAP).png` | - | User table, Modal tambah petugas, Modal reset password cepat | **Khusus role ADMINISTRATOR**. Role OPERATOR tidak dapat melihat menu ini. Mencegah penonaktifan akun Admin terakhir. |

---

## 🚨 5. Fitur Khusus: Notifikasi Darurat Khusus Admin (Emergency Dispatch)

Sesuai kebutuhan lapangan kebencanaan:
1. **Trigger Notifikasi Otomatis ke Admin/Operator:**
   * Saat sensor gempa BMKG mendeteksi gempa Pangandaran yang dirasakan / estimasi tsunami $\rightarrow$ Backend langsung men-dispatch Web Push berprioritas tinggi ke perangkat HP/Laptop Admin & Operator:  
     > *"🚨 PERINGATAN: Gempa Pangandaran M5.3 Dirasakan di Cibenda. Butuh Konfirmasi Aktivasi Sirine!"*
2. **Deep-Link Langsung ke Kontrol Sirine:**
   * Mengeklik notifikasi tersebut akan membuka URL `/admin/devices` dengan modal konfirmasi aktivasi sirine dalam kondisi siap eksekusi.
3. **Eksekusi Operator:**
   * Operator menekan tombol konfirmasi $\rightarrow$ Perintah aktivasi dikirim ke perangkat fisik ESP32 via backend gateway $\rightarrow$ Sirine fisik desa berbunyi.

---

## 💻 6. Instruksi Siap Pakai untuk AI Coding Agents

Jika Anda atau rekan tim menggunakan AI coding assistant (Cursor, Claude, Copilot, Antigravity), salin dan tempelkan blok instruksi di bawah ini ke system prompt / context prompt AI tersebut:

```text
================================================================================
ATURAN PENGEMBANGAN ADMIN PANEL SIGAP DESA CIBENDA (TAHAP 2)
================================================================================
1. REUSE-FIRST: Dashboard Admin (/admin/dashboard) WAJIB me-reuse komponen 
   publik yang sudah terhubung ke API BMKG:
   - <CurrentAlertCard />
   - <WeatherSection />
   - <EarthQuakeSection />
   - <TsunamiCard />
   JANGAN membuat komponen duplikat baru untuk hal-hal di atas!

2. DESAIN SEBAGAI WIREFRAME: Gunakan desain Google Stitch / Figma di 
   folder 'SIGAP Desain Admin/' dan docs/DESIGN_ADMIN.md HANYA sebagai acuan tata letak 
   (wireframe) dan data presentation, bukan untuk membuat design system baru. Styling harus 
   tetap mengikuti Tailwind & CSS token di apps/frontend/src/styles/global.css.

3. REFERENSI LOGIKA BISNIS:
   - Acuan fungsional: docs/sigap-phase-2/ (FS-01 s.d. FS-12).
   - Acuan API backend: docs/API_Spec.md v3.1.
   - Proposal integrasi SID: SIGAP_SID_INTEGRATION_PROPOSAL.md.

4. SAFEGUARDS & RULES:
   - 6 Kontak Inti Desa (is_core = true) tidak boleh dapat dihapus.
   - Sirine hanya dapat di-trigger jika level KUNING / MERAH.
   - Level MERAH wajib memicu modal konfirmasi 2 langkah sebelum eksekusi.
   - Menu "Kelola Akun" (/admin/users) hanya boleh tampil untuk role ADMIN, 
     dan tersembunyi bagi role OPERATOR.
   - Heartbeat ESP32 interval 10 detik, threshold offline 20 detik.
================================================================================
```

---

*Dokumen ini disusun untuk memastikan seluruh tim dan asisten AI bekerja dalam satu visi dan alur development yang solid.*
