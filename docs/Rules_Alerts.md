# Alert & Broadcast Rules

> Project : SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda)
> Version : 1.0
> Status : Draft

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

- Magnitudo
- Kedalaman
- Lokasi Episentrum
- Jarak episentrum terhadap Desa Cibenda
- Potensi tsunami (jika tersedia pada data BMKG)
- Waktu kejadian

## Tsunami

- Status resmi BMKG
- Estimasi tinggi gelombang
- Status pencabutan peringatan

---

# 5. Radius Wilayah

SIGAP menghitung jarak antara koordinat episentrum gempa dan koordinat Desa Cibenda menggunakan koordinat geografis (Latitude & Longitude).

Koordinat referensi:

Desa Cibenda
Latitude : -7.67472
Longitude : 108.55444

Apabila koordinat desa tidak tersedia, sistem dapat menggunakan titik referensi Kabupaten Pangandaran sebagai fallback.

Kategori radius:

- Tinggi : ≤100 km
- Sedang : >100–250 km
- Rendah : >250 km

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

- BMKG mengeluarkan Status WASPADA Tsunami.
- Terdapat gempa dalam radius prioritas SIGAP yang memerlukan perhatian pemerintah desa.
- Pemerintah desa ingin melakukan monitoring lanjutan.

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
- Gempa berkekuatan besar yang berpotensi memberikan dampak signifikan bagi wilayah Pangandaran berdasarkan informasi resmi BMKG.

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

Hitung radius terhadap Pangandaran

↓

Evaluasi parameter:

- Magnitudo
- Kedalaman
- Radius
- Status Tsunami BMKG

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