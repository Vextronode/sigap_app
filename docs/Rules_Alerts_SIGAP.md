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
- OpenStreetMap (Peta Evakuasi)

> Apabila BMKG tidak mengeluarkan informasi resmi, maka SIGAP tidak akan membuat status bencana secara mandiri.

---

# 4. Parameter Decision Engine

SIGAP menggunakan kombinasi beberapa parameter berikut.

## Gempa Bumi

- Magnitudo
- Kedalaman Gempa
- Lokasi Episentrum
- Radius terhadap Pangandaran
- Waktu Kejadian

## Tsunami

- Status resmi BMKG
- Estimasi tinggi gelombang
- Status pencabutan peringatan

---

# 5. Radius Wilayah

Karena SIGAP berfokus pada Desa Cibenda, Kabupaten Pangandaran, maka setiap kejadian gempa akan dihitung berdasarkan jarak episentrum terhadap Pangandaran.

Kategori radius:

- Radius Tinggi : ≤ 100 km
- Radius Sedang : >100 km – 250 km
- Radius Rendah : >250 km

Radius digunakan sebagai salah satu parameter untuk menentukan prioritas broadcast.

---

# 6. Tingkat Status Kesiapsiagaan

## 🟢 AMAN

### Kondisi

- Tidak terdapat peringatan tsunami dari BMKG.
- Tidak terdapat gempa yang berdampak terhadap wilayah Pangandaran.
- Gempa kecil (umumnya < M5) atau berada di luar radius prioritas.

### Tindakan Sistem

- Dashboard diperbarui.
- Tidak mengirim broadcast.
- Menampilkan informasi terbaru kepada masyarakat.

---

## 🟡 WASPADA

### Kondisi

Salah satu kondisi berikut terpenuhi:

- BMKG mengeluarkan Status WASPADA Tsunami.
- Gempa Magnitudo ≥ 5,0.
- Radius kejadian berada dalam wilayah prioritas SIGAP.

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

# 10. Catatan Penting

SIGAP tidak menentukan tingkat bahaya bencana secara mandiri.

SIGAP hanya mengolah dan mendistribusikan informasi resmi yang diterbitkan BMKG agar dapat diterima oleh pemerintah desa dan masyarakat secara lebih cepat, sederhana, dan terstruktur.

Seluruh keputusan evakuasi tetap mengacu pada arahan resmi BMKG, BPBD, dan pemerintah daerah yang berwenang.