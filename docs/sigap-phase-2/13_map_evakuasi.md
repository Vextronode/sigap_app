# FS-13 - Peta Evakuasi Interaktif

| | |
|---|---|
| Kategori Akses | Public |
| Bergantung Pada | FS-04 (Kelola Titik & Jalur Evakuasi - sumber data), Area 3 Roadmap Tahap 2 |
| Status | Final |
| Referensi | PRD.md S2.1 (Success Metrics), S3.1 (Kesiapsiagaan Bencana), S5.3 (Aksesibilitas), S5.4 (Offline Capability), Roadmap Tahap 2 S3 (Area 3) |

## 1. Ringkasan

Peta interaktif berbasis Leaflet + OpenStreetMap yang menampilkan titik evakuasi di wilayah Desa Cibenda. Warga dapat menekan "Arahkan ke sini" pada titik pilihan untuk dialihkan ke Google Maps, yang menghitung rute dari lokasi mereka menggunakan GPS perangkat sendiri - SIGAP tidak membangun routing/navigasi sendiri. Dilengkapi pengurutan titik terdekat berbasis lokasi browser sebagai bantuan tambahan, dan daftar teks alternatif untuk aksesibilitas.

## 2. Actor & Akses

Seluruh pengunjung publik (warga, wisatawan) - tidak memerlukan login (kategori akses Public).

## 3. Alur Fungsional

1. Warga membuka halaman peta evakuasi - peta Leaflet menampilkan wilayah desa dengan marker di setiap titik evakuasi (data dari FS-04).
2. Warga dapat mengizinkan akses lokasi browser (opsional) - jika diizinkan, daftar titik di bawah peta diurutkan dari yang terdekat, dan titik terdekat ditandai visual berbeda di peta.
3. Jika izin lokasi ditolak/tidak tersedia, warga tetap dapat menelusuri seluruh titik secara manual (peta maupun daftar teks) tanpa hambatan fungsional apa pun.
4. Warga memilih satu titik (klik marker di peta, atau baris di daftar) untuk melihat detail singkat (nama, deskripsi).
5. Warga menekan "Arahkan ke sini" → sistem membuka Google Maps (aplikasi jika terpasang, atau versi web) dengan koordinat titik sebagai tujuan.
6. Google Maps meminta izin lokasi/GPS-nya sendiri (independen dari izin lokasi di langkah 2), menghitung rute, dan warga mengikuti navigasi sepenuhnya di Google Maps - SIGAP tidak terlibat lagi setelah titik ini.

## 4. Functional Requirements

- FR1: Menampilkan peta wilayah desa (Leaflet + tile OpenStreetMap) dengan marker untuk setiap titik evakuasi aktif.
- FR2: Menyediakan daftar teks alternatif seluruh titik evakuasi (nama, deskripsi) di luar peta, agar informasi tidak bergantung sepenuhnya pada interaksi peta (selaras NFR 5.3 - informasi kritis tidak boleh bergantung hanya pada satu modalitas).
- FR3: Setiap titik (di peta maupun daftar) memiliki tombol/aksi "Arahkan ke sini" yang membuka Google Maps dengan koordinat titik sebagai tujuan (`https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`), tanpa memaksa asal (origin) - origin ditentukan Google Maps sendiri dari GPS pengguna.
- FR4: Jika browser mengizinkan akses lokasi, sistem menghitung jarak lurus (Haversine) dari posisi pengguna ke setiap titik, mengurutkan daftar dari terdekat, dan menandai titik terdekat secara visual di peta.
- FR5: Permintaan izin lokasi untuk FR4 bersifat opsional dan tidak memblokir fungsi lain - penolakan izin tidak menampilkan error yang mengganggu, cukup daftar tetap tampil dengan urutan default (mis. alfabetis atau urutan input admin).
- FR6: Data titik evakuasi ditarik dari endpoint publik `evacuation_points` (dan `evacuation_routes` jika jalur turut ditampilkan) - sumber tunggal yang sama dengan yang dikelola admin di FS-04.

## 5. Acceptance Criteria

- AC1: Halaman termuat menampilkan seluruh titik evakuasi aktif sebagai marker di peta dan sebagai baris di daftar teks.
- AC2: Klik "Arahkan ke sini" pada titik mana pun membuka Google Maps (tab/app baru) dengan tujuan yang benar sesuai koordinat titik tersebut.
- AC3: Warga mengizinkan lokasi → daftar terurut dari titik terdekat, titik terdekat tertandai berbeda di peta, dan proses ini selesai tanpa interaksi tambahan dari warga (otomatis begitu izin diberikan).
- AC4: Warga menolak/mengabaikan izin lokasi → seluruh titik tetap dapat ditelusuri manual (peta & daftar), tidak ada pesan error yang menghalangi penggunaan, dan warga tetap bisa menekan "Arahkan ke sini" pada titik pilihannya sendiri.
- AC5: Daftar teks alternatif menampilkan informasi yang cukup (nama + deskripsi) untuk dipahami tanpa harus melihat peta - memenuhi NFR 5.3 untuk warga dengan literasi digital terbatas.
- AC6: Perubahan data titik di FS-04 (admin) tercermin di halaman ini tanpa perlu deploy ulang.

## 6. Edge Case & Error Handling

- Belum ada titik evakuasi terdaftar sama sekali - peta dan daftar menampilkan status kosong yang jelas ("Belum ada titik evakuasi terdaftar"), bukan tampilan kosong tanpa keterangan.
- Endpoint data titik evakuasi gagal dimuat - mengikuti prinsip NFR 5.4 (Offline Capability): tampilkan data terakhir yang berhasil dimuat/di-cache beserta indikator waktu, bukan halaman kosong/error total.
- Google Maps tidak dapat dibuka (mis. browser memblokir pop-up, atau perangkat tanpa Google Maps terpasang maupun akses web) - di luar kendali SIGAP; cukup pastikan link menggunakan format standar yang punya fallback web bawaan Google Maps, tidak perlu penanganan khusus tambahan di sisi SIGAP.
- Perangkat tanpa dukungan Geolocation API (browser lama) - FR4 dilewati secara diam-diam (graceful degradation), daftar tetap tampil dengan urutan default seperti kondisi izin ditolak (AC4).
- Titik evakuasi dengan koordinat tidak valid/kosong (seharusnya tidak terjadi karena validasi di FS-04, tapi sebagai pertahanan berlapis) - titik tersebut tidak ditampilkan di peta, namun tetap muncul di daftar teks dengan penanda "lokasi belum tersedia" agar tidak hilang total dari informasi publik.

## 7. Data Terkait

Baca-saja dari `evacuation_points (id, name, latitude, longitude, description)` dan `evacuation_routes (id, route_name, geometry)` - dikelola sepenuhnya lewat FS-04, tidak ada tabel baru untuk fitur ini.

## 8. Dependency & Catatan Terbuka

- **Extends** `SIGAP-E5-S59` (Peta Jalur Evakuasi) dan `SIGAP-E5-S60` (Titik Evakuasi) di backlog v1 - fitur ini bukan pembangunan dari nol, melainkan penambahan interaksi (redirect Google Maps + sort jarak) di atas fondasi yang sudah direncanakan.
- Komponen Leaflet di halaman ini di-reuse dari implementasi yang sama dengan panel admin FS-04 (pin-drop) - sebaiknya dikerjakan berurutan (FS-04 lebih dulu) agar komponen peta tidak dibangun dua kali secara terpisah.
- **Batasan yang disadari:** akurasi navigasi sepenuhnya bergantung pada Google Maps dan konektivitas data pengguna di lapangan - di luar jaminan offline capability SIGAP, yang hanya berlaku untuk menampilkan informasi titik evakuasi di dalam situs, bukan untuk proses navigasi setelah warga berpindah ke Google Maps.
- Sort jarak berbasis Geolocation (FR4) adalah penambahan Tech Lead untuk memenuhi target sukses PRD S2.1 ("menemukan jalur evakuasi terdekat... dalam < 2 menit") - bukan permintaan eksplisit dari diagram awal PM.