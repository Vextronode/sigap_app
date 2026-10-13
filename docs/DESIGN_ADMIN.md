# Desain UI/UX & Spesifikasi Lengkap Admin Panel SIGAP Desa Cibenda
> **Sistem Informasi Gawat Darurat & Monitoring Cuaca Desa Cibenda, Pangandaran**  
> *Panduan Desain Komprehensif & Prompt Ultra-Detailed Siap Pakai untuk Google Stitch*

---

## 🎨 1. Desain Sistem & Panduan Visual (Design Tokens)

Untuk menjaga konsistensi 100% dengan dashboard publik SIGAP yang sudah dibangun:

* **Palet Warna (Color Palette):**
  * **Brand Primary:** `#0F4C81` (Deep Royal Navy Blue) - Header, Sidebar Selected Item, Tombol Utama.
  * **Brand Primary Light:** `#EFF6FF` / `#DBEAFE` (Latar belakang menu aktif / hover).
  * **Neutral Canvas:** `#F8FAFC` (Slate 50) untuk background halaman.
  * **Surface / Container:** `#FFFFFF` (Pure White) dengan `border: 1px solid #E2E8F0` (Slate 200) dan `border-radius: 16px` (`rounded-2xl`).
  * **Typography Color:** `#0F172A` (Slate 900 - Headings), `#334155` (Slate 700 - Body), `#64748B` (Slate 500 - Subtitle & Caption).
* **Status Badges & Indikator:**
  * 🟢 **Hijau (Aman / Online / Sukses):** Text `#059669`, BG `#ECFDF5`, Border `#A7F3D0`
  * 🟡 **Kuning (Waspada):** Text `#D97706`, BG `#FFFBEB`, Border `#FDE68A`
  * 🟠 **Oranye (Siaga):** Text `#EA580C`, BG `#FFF7ED`, Border `#FDBA74`
  * 🔴 **Merah (Awas / Darurat / Offline / Gagal):** Text `#DC2626`, BG `#FEF2F2`, Border `#FECACA`
* **Elemen Khusus:**
  * **Logo Header:** Lambang resmi Kabupaten Pangandaran (perisai biru, gambar banteng/rusa, laut, dan bintang).
  * **Sidebar Status Pill (Bawah Sidebar):** Kotak pill rounded-full dengan animasi dot berdenyut (`🟢 Alat Terhubung` / `🔴 Koneksi Alat Terputus`).
  * **User Profile Widget (Topbar):** Avatar bulat berdenyut (Navy untuk Administrator, Hijau untuk Operator) + 2 baris teks (Nama Lengkap & Role).

---

## 🗺️ 2. Struktur Navigasi & Arsitektur Halaman Admin

Sidebar navigasi di kiri memiliki lebar tetap `260px` dengan menu:
1. 🔐 **Halaman Login Admin** (`/admin/login`) — *Layar terpisah tanpa sidebar*
2. 📊 **Dashboard Utama** (`/admin/dashboard`) — *Ringkasan kondisi bencana, hardware IoT, dan kesehatan data*
3. 🚨 **Pusat Kontrol Sirine & IoT** (`/admin/devices`) — *Remote trigger sirine 2-langkah, status ESP32, dan audit log*
4. 📋 **Verifikasi Alert & Log Bencana** (`/admin/alerts`) — *Klasifikasi administratif data gempa/tsunami BMKG*
5. 🛡️ **Kelola Kesiapsiagaan Desa** (`/admin/kesiapsiagaan`) — *Tab Kontak (6 kontak inti terproteksi), Evakuasi (Peta Leaflet), dan Panduan*
6. 📡 **Log Notifikasi & Integrasi SID** (`/admin/logs`) — *Audit trail push notification warga & sinkronisasi SID*
7. 👥 **Manajemen Akun & Role** (`/admin/users`) — *CRUD admin/operator khusus role Administrator*

---

## 🎯 3. MASTER PROMPT GOOGLE STITCH (Context & Design Brief)

Gunakan **Master Prompt** berikut di awal sesi Google Stitch untuk memberikan pemahaman menyeluruh tentang sistem, filosofi, konteks kebencanaan, dan standar visual SIGAP. Setelah memberikan Master Prompt ini, kamu bisa memberikan prompt spesifik per halaman di bawahnya atau melampirkan file `DESIGN_ADMIN.md` ini ke Google Stitch.

```markdown
# 🏛️ PROJECT CONTEXT & DESIGN BRIEF: SIGAP ADMIN PORTAL

## 1. Project Background & Purpose
- Project Name: SIGAP (Sistem Informasi Gawat Darurat & Monitoring Cuaca)
- Target Area: Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran, Jawa Barat, Indonesia.
- Purpose: A high-reliability emergency management and weather monitoring admin portal used by local village officials (Administrator & Field Operators) to monitor disaster threats (earthquakes, tsunami warnings, extreme weather from BMKG), manage village emergency preparedness (evacuation routes, emergency contacts, guides), monitor physical ESP32 siren hardware status, and safely trigger sirens in emergency situations with strict human-in-the-loop safeguards.

## 2. Design Philosophy & Visual Language
- Visual Theme: Ultra-clean, modern, highly legible, mission-critical government & disaster operations dashboard.
- Consistency with Citizen Portal: Must share the exact visual DNA of the existing SIGAP Citizen Dashboard:
  - Background: Crisp, clean light slate (#F8FAFC).
  - Cards & Containers: Pure white (#FFFFFF) with rounded-2xl corners (16px/18px/24px) and subtle slate borders (#E2E8F0).
  - Primary Brand Navy: Deep Royal Navy Blue (#0F4C81) representing trust and official government authority.
  - Accent Palette: Emerald Green (#059669 for Safe/Online), Amber Yellow (#D97706 for Warning/Waspada), Deep Orange (#EA580C for Alert/Siaga), and Crimson Red (#DC2626 for Emergency/Awas/Offline).
  - Component Pattern: Modular, statistical cards inspired by the existing "WeatherSection" card widget (white surface, subtle stat sub-grid boxes, clean icons, bold numbers).

## 3. Key Personas & Roles
- Persona 1: Administrator Desa (Full access: System configuration, managing user accounts, reviewing alerts, triggering sirens, managing preparedness).
- Persona 2: Operator Lapangan (Operational access: Monitoring live dashboard, reviewing alerts, executing emergency siren triggers; cannot access user account management).

## 4. Instructions for Google Stitch
When generating UI screens for this project:
1. Always maintain consistent left sidebar navigation with the official emblem of Kabupaten Pangandaran and the live IoT connection pill at the bottom.
2. In the top header, include the User Profile & Role Indicator Badge featuring a live pulsing halo ring (Royal Navy for Admin, Emerald Green for Operator).
3. Use real, contextually accurate Indonesian text and geographical references (e.g., Desa Cibenda, Kec. Parigi, Kab. Pangandaran, BMKG, InaTEWS, BPBD Pangandaran).
4. Strictly follow the component layouts and specifications documented in the screen-by-screen prompts below.
```

---

## 📝 4. PROMPT SPESIFIK PER HALAMAN (Detailed Screen Prompts)

Salin prompt di bawah ini langsung ke Google Stitch untuk menghasilkan masing-masing layar desain:

---

### 🟢 PROMPT 1: Halaman Login Admin (`/admin/login`)

```text
Design a pixel-perfect, ultra-modern Admin Authentication Screen for "SIGAP Desa Cibenda" (Sistem Informasi Gawat Darurat & Monitoring Cuaca Desa Cibenda, Kabupaten Pangandaran).

Layout & Atmosphere:
- Device viewport: Desktop 1440x900px, centered auth card.
- Background: Clean, minimal light slate background (#F8FAFC) decorated with a very subtle background SVG wave pattern representing coastal Pangandaran in soft translucent blue (#E2E8F0, opacity 40%).
- Auth Card: Centered card, width 440px, background pure white (#FFFFFF), border 1px solid #E2E8F0, border-radius 24px (rounded-3xl), box-shadow 0 20px 40px -15px rgba(15, 76, 129, 0.08), padding 40px 36px.

Card Header:
- Top Center: High-resolution emblem/logo of Kabupaten Pangandaran (blue shield with deer/mountains/ocean crest), height 64px, width 64px, perfectly centered.
- Spacing 16px below logo:
  - Title: "SIGAP Admin Portal", font-family "Plus Jakarta Sans", bold (weight 700), font-size 22px, color #0F172A, text-align center.
  - Subtitle: "Desa Cibenda, Kec. Parigi, Kab. Pangandaran", font-size 13px, font-weight 500, color #64748B, text-align center, margin-top 4px.

Form Elements (Vertical stack with 20px gap):
1. Email Field:
   - Label: "Email Administrator / Petugas", font-size 13px, font-weight 600, color #334155.
   - Input Box: Height 48px, background #F8FAFC, border 1px solid #CBD5E1, border-radius 12px, padding left 44px (with Mail icon in #94A3B8), placeholder "admin@cibenda.desa.id" in #94A3B8, font-size 14px.
2. Password Field:
   - Label: "Kata Sandi", font-size 13px, font-weight 600, color #334155.
   - Input Box: Height 48px, background #F8FAFC, border 1px solid #CBD5E1, border-radius 12px, padding left 44px (with Lock icon in #94A3B8), padding right 44px (with Eye toggle icon in #64748B), value "••••••••••••", font-size 14px.
3. Security Rate-Limit State Indicator:
   - Subtle security banner: Background #FEF2F2, border 1px solid #FECACA, border-radius 10px, padding 10px 14px, display flex with Shield-Alert icon in #DC2626, text: "Sistem diamankan dengan rate limiting (maksimal 5x percobaan gagal sebelum akun terkunci 15 menit)", font-size 11px, color #991B1B, line-height 1.4.
4. Action Button:
   - Submit Button: Full-width, height 50px, background deep royal navy #0F4C81, hover color #0A365C, text "Masuk ke Dashboard Admin", font-size 15px, font-weight 600, text color #FFFFFF, border-radius 12px, box-shadow 0 4px 12px rgba(15, 76, 129, 0.25), display flex with Login/Arrow-Right icon.

Card Footer:
- 24px below button, divider line with 1px solid #F1F5F9.
- Link: Centered button "← Kembali ke Portal Informasi Warga", text color #0F4C81, font-size 13px, font-weight 600, cursor pointer.
```

---

### 🟢 PROMPT 2: Dashboard Ringkasan Admin (`/admin/dashboard`)

```text
Design a complete, high-fidelity Admin Dashboard for "SIGAP Desa Cibenda" featuring a unified left navigation sidebar, custom topbar with live user status, and modular metric cards styled like clean weather widgets.

Canvas Layout (1440x960px Desktop):
- Left Sidebar: Width 260px, fixed height, background #FFFFFF, border-right 1px solid #E2E8F0, padding 24px 16px, display flex flex-col justify-between.
- Topbar: Height 72px, background #FFFFFF, border-bottom 1px solid #E2E8F0, padding 0 32px, display flex justify-between align-center.
- Main Content Body: Background #F8FAFC, padding 32px, display flex flex-col gap 24px.

Sidebar Details:
- Top Header: Logo Kabupaten Pangandaran (36x36px) next to two-line text: "SIGAP" (bold navy #0F4C81, 16px) and "Desa Cibenda" (gray #64748B, 12px).
- Navigation Menu (Vertical list, gap 6px):
  - [Active] Dashboard Ringkasan (Home icon, background #EFF6FF, text #0F4C81, font-weight 600, border-radius 10px).
  - Kontrol Sirine & IoT (Radio-tower icon, text #475569, font-weight 500).
  - Verifikasi Alert (Shield-alert icon, text #475569).
  - Kesiapsiagaan Desa (Map-pin icon, text #475569).
  - Log & Integrasi SID (Activity icon, text #475569).
  - Kelola Akun (Users icon, text #475569).
- Bottom Sidebar Pill Widget:
  - Card pill container: Background #FFFFFF, border 1px solid #E2E8F0, border-radius 9999px (full rounded), padding 8px 14px, display flex align-center gap 8px.
  - Left: Pulsing bright green dot with soft glow ring.
  - Right Text: "Alat Terhubung" in bold #0F172A, font-size 12px, subtitle "ESP32-01 (10s lalu)" in #64748B, font-size 10px.

Topbar Header Details:
- Left: Title "Dashboard Ringkasan Admin", font-size 18px, font-weight 700, color #0F172A, with breadcrumb "Admin / Overview".
- Right: User Profile & Role Indicator Badge:
  - Container: White pill box, border 1px solid #E2E8F0, border-radius 14px, padding 6px 14px, display flex align-center gap 12px.
  - Avatar: Circular 38px badge in solid Navy Blue (#0F4C81) with white Shield icon and an animated pulsing outer halo ring (#93C5FD).
  - Text: Line 1 "Budi Santoso" (bold 13px, #0F172A); Line 2 "Administrator Desa" (medium 11px, #64748B).
  - Logout Icon Button: Small rounded button with power-off icon in #94A3B8, hover red #EF4444.

Main Content Area:
1. Top Alert Status Banner (Full Width):
   - Background #ECFDF5, border 1px solid #A7F3D0, border-radius 16px, padding 18px 24px, display flex justify-between align-center.
   - Left: Large Shield-Check icon in green (#059669), Title "STATUS KESIAPSIAGAAN: AMAN (GREEN)", Subtitle "Tidak terdeteksi ancaman gempa berdampak atau potensi tsunami untuk wilayah Desa Cibenda. Data BMKG diperbarui otomatis tiap 60 detik."
   - Right: Pill badge "Sistem Otomatis Aktif" in emerald green.

2. Grid 3 Kolom Status Utama (Modular Weather-Widget Style Cards, White #FFFFFF, border 1px solid #E2E8F0, border-radius 18px, padding 22px):
   - Card 1 (Monitoring Cuaca Terkini):
     - Header: Icon Cloud-Sun in #0284C7 + Text "Cuaca Saat Ini (Desa Cibenda)".
     - Big Metric: "24°C" (font-size 32px, bold navy #0F4C81), Condition "Cerah Berawan" (font-weight 600).
     - Sub-grid 3 kotak kecil: Kelembapan "91%" (Droplet icon), Angin "16 km/jam" (Wind icon), Jarak Pandang "> 7 km" (Eye icon).
   - Card 2 (Status Gempa Pangandaran):
     - Header: Icon Activity in #DC2626 + Text "Gempa Terdekat (Pangandaran)".
     - Big Metric: "M 4.2" (bold 32px #DC2626), Depth "18 km", Lokasi "79 km Barat Daya Pangandaran" (13px #475569).
     - Status: Green Pill Badge "Tidak Berpotensi Tsunami" + "Dirasakan: II-III MMI".
   - Card 3 (Status Hardware Sirine Balai Desa):
     - Header: Icon Radio-tower in #7C3AED + Text "Hardware Sirine (ESP32-01)".
     - Status: Large Green Badge "ONLINE (Aktif)", Heartbeat "Terakhir 10 detik lalu".
     - 3-LED Status Indicator: 🟢 Hijau (Menyala Aktif), 🟡 Kuning (Mati), 🔴 Merah (Mati).
     - Quick Action Button: "Buka Pusat Kontrol Sirine →" in outlined blue.

3. Section Bawah: External Health Check & Service Monitor (Multi-item grid card):
   - Card container with title "Status Konektivitas Sumber Data & Layanan":
   - 4 Item columns:
     - Item 1: API BMKG Cuaca (🟢 Terhubung - Respon 120ms)
     - Item 2: API BMKG Gempa & Tsunami (🟢 Terhubung - Respon 95ms)
     - Item 3: Gateway Aplikasi SID Cibenda (🟢 Terhubung - Endpoint Active)
     - Item 4: Web Push Notification Engine (🟢 142 Subscriber Warga Aktif)
```

---

### 🟢 PROMPT 3: Pusat Kontrol Sirine & Remote Emergency Trigger (`/admin/devices`)

```text
Design the "Pusat Kontrol Sirine & Hardware IoT" page for SIGAP Admin, featuring remote siren trigger safeguards, hardware telemetry, and dual audit log cards styled after the modular weather widget.

Sidebar: Consistent SIGAP left sidebar with "Kontrol Sirine & IoT" active.
Topbar: Topbar with breadcrumb "Admin / Pusat Kontrol Sirine" and user role badge (Budi Santoso - Administrator).

Main Content Area:
1. Header:
   - Title: "Pusat Kontrol Sirine & Perangkat IoT Desa Cibenda", font-size 22px, bold #0F172A.
   - Subtitle: "Kendali jarak jauh sirene fisik gawat darurat dan pemantauan konektivitas perangkat ESP32", font-size 14px, #64748B.

2. Hero Emergency Control Card (Top Banner Container, White #FFFFFF, border 2px solid #E2E8F0, border-radius 20px, padding 28px):
   - Layout: 3 Columns flex horizontal.
   - Column 1 (Hardware Visualizer):
     - Diagram representation of ESP32 Siren Device labeled "Unit Sirine 01 - Balai Desa Cibenda".
     - Status tag: Green Pill "ONLINE" with pulsing beacon.
     - 3 Physical LED Indicator Lights (Large 24px circles with glowing halos):
       - 🟢 Hijau: Active Glowing Green (Level AMAN)
       - 🟡 Kuning: Inactive Dark Yellow (Level SIAGA)
       - 🔴 Merah: Inactive Dark Red (Level AWAS)
   - Column 2 (Telemetry & Trigger Condition):
     - Status Level Saat Ini: "AMAN (GREEN)".
     - Sumber Trigger Otomatis: "BMKG InaTEWS / AutoGempa".
     - Keterangan: "Tombol aktivasi sirine hanya dapat dipicu apabila status kesiapsiagaan memasuki level SIAGA (Kuning) atau AWAS (Merah)."
   - Column 3 (Action Button State):
     - State Normal (Current View): Big button (height 56px, width 260px) in disabled muted gray (#E2E8F0), lock icon, text "Sirine Terkunci (Level Aman)".
     - State Active Preview (Side note banner): High-visibility pulsing Red Button "🚨 AKTIFKAN SIRINE JARAK JAUH" (Trigger modal preview).

3. Popup Modal Safeguard (Shown in overlay preview for Level Merah activation):
   - Modal box (width 480px, white, rounded-2xl, border 2px solid #EF4444, shadow 0 25px 50px rgba(220, 38, 38, 0.25), padding 28px).
   - Top Icon: Red pulsing loudspeaker/alarm icon (48x48px).
   - Title: "KONFIRMASI AKTIVASI SIRINE DARURAT", font-size 18px, bold #991B1B.
   - Alert Text Box: Background #FEF2F2, border 1px solid #FECACA, border-radius 10px, padding 12px, text: "PERINGATAN! Anda akan membunyikan sirine fisik di area Desa Cibenda dengan nada sirene penuh Level AWAS. Tindakan ini akan memicu kepanikan warga jika tidak sesuai protokol resmi!".
   - Parameter: Pemicu: "Gempa Pangandaran M5.3 Berpotensi Tsunami", Operator: "Budi Santoso (Admin)", Waktu: "31 Agustus 2026 21:45 WIB".
   - Action Buttons: Button "Batal" (Gray outlined) & Button "YA, BUNYIKAN SIRINE SEKARANG" (Solid Red #DC2626, height 48px, bold white).

4. Bottom Section: 2 Modular Log Cards (Weather Section Card Aesthetic, 2 Column Grid):
   - Card 1: "Riwayat Heartbeat & Diagnostik ESP32"
     - Metric Row: Total Heartbeat 24 Jam "8.640" | Uptime "99.9%" | Rata-rata Latensi "115ms".
     - Mini Table: Timestamp (10s interval), Kode Device ("ESP32-CIBENDA-01"), Status ("ONLINE"), Level Dikirim ("GREEN"), Status ACK ("SUCCESS 200 OK").
   - Card 2: "Audit Trail Aktivasi Sirine Fisik & Remote"
     - Metric Row: Total Aktivasi "3x (Bulan Ini)" | Uji Coba "2x" | Kondisi Riil "1x".
     - Table: Waktu Aktivasi, Jalur Pemicu (Badge "Remote App" vs "Tombol Fisik Lokal"), Tingkat Bahaya (Badge Merah/Kuning), Petugas Eksekutor ("Budi Santoso - Admin"), Durasi Bunyi ("3 Menit").
```

---

### 🟢 PROMPT 4: Verifikasi & Riwayat Alert Bencana (`/admin/alerts`)

```text
Design the "Verifikasi & Riwayat Alert Bencana" admin page for SIGAP Desa Cibenda, focused on reviewing and administratively validating BMKG seismic and tsunami alerts.

Sidebar: Consistent SIGAP left sidebar with "Verifikasi Alert" active.
Topbar: Breadcrumb "Admin / Verifikasi Alert" and user profile badge.

Main Content Area:
1. Header:
   - Title: "Verifikasi & Riwayat Alert Bencana", font-size 22px, bold #0F172A.
   - Subtitle: "Daftar riwayat peringatan resmi BMKG dan pencatatan audit verifikasi administratif oleh aparat desa", font-size 14px, #64748B.

2. Summary Metric Cards (4-Column Weather-Card Modular Grid):
   - Box 1 (Total Alert Bulan Ini): Number "18", Subtitle "Semua sumber BMKG", Blue theme icon.
   - Box 2 (Dikonfirmasi Warga): Number "11", Green badge "Dirasakan Nyata", Green theme icon.
   - Box 3 (Ditolak / Nihil): Number "5", Gray badge "Tidak Berdampak", Gray theme icon.
   - Box 4 (Ditindaklanjuti): Number "2", Orange badge "Evakuasi Lapangan", Orange theme icon.

3. Main Data Table Card (White #FFFFFF, border 1px solid #E2E8F0, border-radius 18px, padding 20px):
   - Filter Bar:
     - Search Input: "Cari ID Alert, lokasi, pesan..."
     - Dropdown 1: Severity (Semua Level, Merah/Awas, Oranye/Siaga, Kuning/Waspada, Hijau/Aman).
     - Dropdown 2: Status Tinjauan (Semua, Belum Ditinjau, Dikonfirmasi, Ditolak, Ditindaklanjuti).
     - Date Range: "30 Hari Terakhir".
   - Table Columns:
     - Waktu Trigger: "31 Agu 2026, 14:20:15 WIB" (bold 13px #0F172A).
     - Tingkat Bahaya: Badge Pill 🔴 RED / 🟠 ORANGE / 🟡 YELLOW / 🟢 GREEN.
     - Sumber & Tipe: "BMKG AutoGempa (Gempa Lokal Pangandaran)".
     - Deskripsi Parameter: "M 5.3, Kedalaman 18 km, 79 km Barat Daya Pangandaran. Dirasakan III MMI di Cibenda."
     - Status Tinjauan: Badge "Belum Ditinjau" (#F1F5F9 text #475569) / "Dikonfirmasi" (#ECFDF5 text #059669) / "Ditindaklanjuti" (#FFF7ED text #EA580C).
     - Aksi: Blue outlined Button "Tinjau Detail →".

4. Modal Tinjauan Alert (Drawer/Popup preview):
   - Title: "Detail Alert #ALT-2026-0831-01"
   - Parameter Box: Visual Shakemap BMKG thumbnail + Grid parameter gempa (Magnitudo, Episentrum, Jarak ke Cibenda 87 km).
   - Radio Option:
     - [ ] Dikonfirmasi (Gempa nyata dirasakan warga, peringatan valid)
     - [ ] Ditolak (Guncangan tidak terasa di Desa Cibenda)
     - [ ] Ditindaklanjuti (Aparat desa mengarahkan warga ke titik evakuasi)
   - Catatan Lapangan: Textarea "Catatan hasil konfirmasi RT/RW...".
   - Info Note: "Perubahan status ini bersifat administratif untuk pelaporan dan tidak membatalkan push notifikasi publik yang sudah terkirim."
   - Buttons: "Batal" & "Simpan Hasil Tinjauan".
```

---

### 🟢 PROMPT 5: Kelola Kesiapsiagaan Desa (`/admin/kesiapsiagaan`)

```text
Design the "Kelola Kesiapsiagaan Desa" multi-tab admin page for SIGAP, managing emergency contacts with core protection, interactive evacuation map, and preparedness guides.

Sidebar: Consistent SIGAP left sidebar with "Kesiapsiagaan Desa" active.
Topbar: Breadcrumb "Admin / Kelola Kesiapsiagaan" and user profile badge.

Main Content:
1. Top Tab Navigation (Pill container, background #F1F5F9, padding 4px, border-radius 12px, width fit-content):
   - [Active Tab] Kontak Darurat (Phone icon)
   - [Tab] Titik & Jalur Evakuasi (Map icon)
   - [Tab] Panduan Kesiapsiagaan (Book-open icon)

2. Content Tab 1: Kontak Darurat Gawat Darurat (Card White, rounded-2xl, border #E2E8F0, padding 24px):
   - Header Bar: Text "Daftar Kontak Darurat Desa Cibenda" + Blue Button "+ Tambah Kontak Baru".
   - Information Alert Box: "6 Kontak Inti Sistem (Ambulans, Damkar, Polsek, Puskesmas, BPBD, Kantor Desa) dilindungi dan tidak dapat dihapus dari sistem, hanya nomor telepon yang dapat diperbarui."
   - Table List:
     - Row 1: Ambulans Pangandaran | 119 / 0812-3456-7890 | Badge Biru "KONTAK INTI" | Aksi: Button "Edit Nomor" (Button Hapus disabled dengan gembok).
     - Row 2: Damkar Pangandaran | 0265-639113 | Badge Biru "KONTAK INTI" | Aksi: Button "Edit Nomor" (Gembok).
     - Row 3: Polsek Parigi | 0265-639110 | Badge Biru "KONTAK INTI" | Aksi: Button "Edit Nomor" (Gembok).
     - Row 4: Puskesmas Parigi | 0265-639324 | Badge Biru "KONTAK INTI" | Aksi: Button "Edit Nomor" (Gembok).
     - Row 5: BPBD Kabupaten Pangandaran | 0265-639090 | Badge Biru "KONTAK INTI" | Aksi: Button "Edit Nomor" (Gembok).
     - Row 6: Kantor Desa Cibenda | 0821-9876-5432 | Badge Biru "KONTAK INTI" | Aksi: Button "Edit Nomor" (Gembok).
     - Row 7: Posko Relawan RT 04 (Kontak Tambahan) | 0852-1122-3344 | Badge Abu-abu "TAMBAHAN" | Aksi: Button "Edit" & Button "Hapus" (Merah).

3. Content Tab 2: Preview Peta Titik & Jalur Evakuasi (2 Column Grid):
   - Left Side (60%): Interactive Map Canvas (Leaflet/OSM style) of Desa Cibenda showing:
     - Green Shelter Pins: "Titik Kumpul 01 - Lapangan Sepakbola Cibenda", "Titik Kumpul 02 - Dataran Tinggi Bukit Parigi".
     - Orange Polyline: Jalur Evakuasi Utama (Evacuation Route corridor).
     - Map Pin-Drop Toolbar: "Klik pada peta untuk mengambil koordinat Lat/Lng otomatis".
   - Right Side (40%): Table of Registered Shelters (Nama Lokasi, Kapasitas Orang, Ketinggian mdpl, Aksi).

4. Content Tab 3: Panduan Kesiapsiagaan (Grid Card list):
   - Table of guides: Judul ("Panduan Mitigasi Gempa Bumi Megathrust", "Rute Penyelamatan Diri Tsunami"), Tipe ("Artikel Asli" vs "Link Eksternal BNPB"), Status ("Dipublikasikan"), Aksi ("Edit", "Hapus").
```

---

### 🟢 PROMPT 6: Log Notifikasi & Integrasi SID (`/admin/logs`)

```text
Design the "Monitoring Notifikasi & Integrasi SID" log dashboard page for SIGAP Admin, formatted in clean modular weather-card widget style.

Sidebar: Consistent SIGAP left sidebar with "Log & Integrasi SID" active.
Topbar: Breadcrumb "Admin / Log Notifikasi & Integrasi SID" and user profile badge.

Main Content Area:
1. Header:
   - Title: "Monitoring Notifikasi & Integrasi SID", font-size 22px, bold #0F172A.
   - Subtitle: "Audit trail pengiriman Web Push Notification warga dan status integrasi gateway Sistem Informasi Desa (SID)", font-size 14px, #64748B.

2. Top Summary Widget (Modular 3-Column Grid):
   - Card 1 (Web Push Notifikasi SIGAP):
     - Metric: "142 Perangkat Terdaftar" (Bold 28px navy #0F4C81).
     - Stats: Sukses: 99.1% | Gagal: 0.9% | Rata-rata Pengiriman: 1.1s.
   - Card 2 (Integrasi Gateway Aplikasi SID):
     - Metric: "Status 200 OK (Terhubung)" (Bold 28px green #059669).
     - Endpoint: "POST /api/integrations/sigap/notifications" | Terakhir Sync: "3 menit lalu".
   - Card 3 (Notifikasi Level Terakhir):
     - Metric: "Alert Level GREEN (Aman)" | Waktu: "Hari ini, 14:00 WIB" | Terkirim ke: "142 Browser + PWA SID".

3. Filter Tabs & Search Bar:
   - Filter Tabs: [Semua Log (128)] | [Web Push SIGAP (94)] | [Integrasi SID (34)] | [Gagal / Retry (2)]
   - Search: "Cari judul notifikasi, status, ID..."

4. Full Data Log Table Card (White, rounded-2xl, border #E2E8F0, padding 20px):
   - Table Columns:
     - Waktu Kirim: "31 Agu 2026 21:00:12 WIB"
     - Kanal: Badge "Web Push Browser" (Biru) / "Gateway SID PWA" (Ungu)
     - Tingkat Bahaya: Badge 🔴 MERAH / 🟡 KUNING / 🟢 HIJAU
     - Judul Pesan: "Peringatan Dini Gempa Terkini Pangandaran M4.2"
     - Target Penerima: "142 Subscriber Browser" / "Server SID Cibenda"
     - Status Pengiriman: Badge 🟢 "Terkirim (141/142)" / 🟡 "Retry 1x (Berhasil)" / 🔴 "Gagal (Timeout 504)"
     - Rincian Respon: "HTTP 200 OK (Latency 85ms)"
```

---

### 🟢 PROMPT 7: Manajemen Akun & Pengguna (`/admin/users`)

```text
Design the "Manajemen Akun & Role" page for SIGAP Admin, exclusively accessible to the Administrator role.

Sidebar: Consistent SIGAP left sidebar with "Kelola Akun" active.
Topbar: Breadcrumb "Admin / Kelola Akun & Petugas" and user profile badge (Budi Santoso - Administrator).

Main Content:
1. Header & Quick Action Bar:
   - Title: "Manajemen Akun Pengguna & Hak Akses", font-size 22px, bold #0F172A.
   - Subtitle: "Kelola akun petugas desa, penugasan peran Administrator dan Operator Lapangan", font-size 14px, #64748B.
   - Right Action: Button "+ Tambah Petugas Baru" (Royal Navy #0F4C81, height 44px, bold white, rounded-xl).

2. User Data Table Card (White, rounded-2xl, border #E2E8F0, padding 24px):
   - Search & Filter: Input cari nama/email + Dropdown filter Role (Semua, Administrator, Operator).
   - Table Columns:
     - Petugas: Avatar bulat inisial + Nama "Budi Santoso" (bold 14px) + Email "budi@cibenda.desa.id".
     - Role Hak Akses: Badge Biru "ADMINISTRATOR" (Full Access) / Badge Hijau "OPERATOR" (Operasional & Sirine).
     - Status Akun: Toggle Switch hijau aktif "Aktif" / abu-abu "Nonaktif".
     - Sesi & Login Terakhir: "Hari ini, 21:15 WIB (Chrome Windows)".
     - Aksi: Button "Reset Password" & Button "Ubah Role" & Button "Hapus".
     - Safeguard Protection: Baris untuk Akun Administrator Utama memiliki badge gembok "Akun Utama" dengan toggle nonaktif disabled agar sistem tidak pernah kehilangan admin.

3. Quick Reset Password Modal (Popup Preview):
   - Modal container (width 400px, white, rounded-2xl, border #E2E8F0, padding 24px).
   - Title: "Reset Kata Sandi - Asep Hidayat"
   - Input 1: "Kata Sandi Baru" (placeholder: minimal 8 karakter).
   - Input 2: "Konfirmasi Kata Sandi Baru".
   - Info Box: "Sesi login aktif pengguna di perangkat lain akan otomatis tergugurkan setelah password direset."
   - Action Buttons: "Batal" & "Simpan & Terapkan Kata Sandi".
```

---

*Dokumen diperbarui otomatis dengan prompt ultra-detail yang siap langsung disalin ke Google Stitch.*
