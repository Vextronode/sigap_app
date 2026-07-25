# Architecture Decision Record - Arsitektur IoT & Sirine

| | |
|---|---|
| **Document Type** | Architecture Decision Record (ADR) |
| **Domain** | IoT & Siren Actuation Architecture |
| **Status** | Approved |
| **Version** | 1.0 |
| **Date** | 20 July 2026 |
| **Author** | Tech Lead, SIGAP |
| **Applies To** | `db/schema/005_iot_kesiapsiagaan.sql`, `db/data-dictionary/DD_iot_kesiapsiagaan.md`, dokumentasi hardware Tim IoT |

---

## ADR-011: Safeguard Level Aktivasi Sirine - Hanya Oranye dan Merah

### Latar Belakang Keputusan
Status kesiapsiagaan SIGAP memiliki 4 level (ADR-003). Perlu ditentukan level mana yang diizinkan memicu aktivasi sirine fisik, mengingat aktivasi sirine berdampak langsung ke masyarakat (potensi kepanikan bila dipicu tanpa dasar yang memadai).

### Alternatif yang Dipertimbangkan
1. Seluruh level non-Hijau (Kuning, Oranye, Merah) dapat memicu sirine dengan kategori bunyi berbeda.
2. Hanya level Oranye dan Merah yang dapat memicu sirine; Kuning murni indikator visual tanpa opsi aktivasi.

### Keputusan yang Dipilih
Opsi 2 - sirine hanya dapat diaktifkan pada level Oranye dan Merah.

### Alasan Pemilihan
- Level Kuning (Waspada) merepresentasikan kondisi kewaspadaan dini yang belum memerlukan respons akustik ke seluruh warga - aktivasi sirine pada level ini berisiko menimbulkan kepanikan yang tidak proporsional terhadap tingkat ancaman aktual.
- Mempersempit kondisi pemicu sirine dari 3 level non-Hijau menjadi 2 level mengurangi permukaan risiko kesalahan aktivasi tanpa mengurangi kemampuan sistem merespons kondisi yang benar-benar mendesak.

### Dampak Terhadap Sistem
- Constraint ini ditegakkan di dua lapis: `CHECK` constraint pada kolom `level_at_trigger` di tabel `siren_action_log` (database), dan validasi bisnis pada endpoint `trigger-siren` (aplikasi) - tidak hanya diasumsikan pada satu lapis saja.
- Perangkat fisik (Perangkat 1) menonaktifkan status tombol pemicu sirine pada level Hijau dan Kuning, konsisten dengan constraint di sisi backend.

---

## ADR-012: Arsitektur Hybrid Aktivasi Sirine - Lokal Fisik dan Remote Aplikasi

### Latar Belakang Keputusan
Aktivasi sirine adalah aksi keselamatan yang harus tetap berfungsi meski jaringan/internet terganggu - kondisi yang justru mungkin terjadi bersamaan dengan bencana. Di sisi lain, terdapat kebutuhan operasional agar operator yang sedang tidak berada di lokasi (dinas luar) tetap dapat memicu sirine.

### Alternatif yang Dipertimbangkan
1. **Lokal fisik saja** - tombol terhubung langsung ke rangkaian sirine, tanpa kemampuan remote.
2. **Remote-mediated saja** - seluruh aktivasi melalui platform, memerlukan konektivitas jaringan.
3. **Hybrid** - jalur lokal fisik selalu tersedia sebagai jalur utama; kemampuan remote ditambahkan sebagai jalur pelengkap.

### Keputusan yang Dipilih
Opsi 3 - hybrid, dengan jalur lokal fisik sebagai fondasi utama yang harus selalu berfungsi tanpa bergantung jaringan. Kemampuan remote aplikasi disiapkan sebagai kemampuan tambahan, namun **implementasinya sengaja ditangguhkan** - belum dirancang lebih lanjut karena kondisi operasional saat kemampuan ini dibutuhkan belum dapat dipastikan sejak sekarang.

### Alasan Pemilihan
- Opsi 2 ditolak karena menjadikan fungsi keselamatan inti bergantung sepenuhnya pada ketersediaan jaringan - risiko yang tidak dapat diterima untuk sistem peringatan bencana.
- Opsi 1 saja tidak mengakomodasi kebutuhan operasional nyata (operator dapat berada di luar lokasi saat kondisi darurat terjadi).
- Menangguhkan desain detail jalur remote (bukan membatalkannya) adalah keputusan sadar - merancang mekanisme remote secara prematur, sebelum kondisi operasional nyata diketahui, berisiko menghasilkan desain yang harus dirombak ulang.

### Dampak Terhadap Sistem
- Skema database (`siren_action_log.trigger_source`) sudah mengakomodasi kedua jalur (`lokal_fisik`, `remote_aplikasi`) sejak awal, sehingga penambahan jalur remote di masa depan tidak memerlukan migrasi skema.
- Endpoint API `trigger-siren` sudah terdefinisi dalam kontrak API (ADR-016), namun implementasi aktualnya menunggu keputusan lanjutan - dicatat sebagai backlog, bukan kebutuhan MVP saat ini.
- Dokumentasi hardware Tim IoT perlu diperbarui untuk secara eksplisit menyatakan bahwa jalur remote belum diimplementasikan, mencegah asumsi keliru bahwa kemampuan ini sudah aktif.

---

## ADR-013: Protokol Komunikasi Platform ↔ Perangkat - REST Polling Langsung ke Backend

> **Catatan revisi:** ADR ini merevisi keputusan awal yang sempat mengusulkan Firebase Realtime Database sebagai protokol komunikasi. Revisi dilakukan setelah implementasi prototipe aktual dari Tim IoT diperiksa - prototipe sudah berfungsi menggunakan HTTP Polling, bukan Firebase.

### Latar Belakang Keputusan
Perangkat IoT (indikator level) memerlukan mekanisme untuk menerima pembaruan level kesiapsiagaan dari backend secara berkala. Keputusan awal dibuat berdasarkan efisiensi implementasi di atas kertas, sebelum status implementasi prototipe yang sudah berjalan diperiksa kembali.

### Alternatif yang Dipertimbangkan
1. **Firebase Realtime Database** - dipertimbangkan pada tahap awal karena sudah tercantum di tech stack dan menjanjikan reconnect/offline handling bawaan tanpa infrastruktur tambahan.
2. **REST Polling langsung ke backend** - perangkat memanggil endpoint backend secara berkala (interval tetap), tanpa komponen infrastruktur tambahan.
3. MQTT, WebSocket, LoRa, SMS/GSM - dipertimbangkan pada tahap perbandingan awal, tidak dipilih karena menambah komponen infrastruktur baru tanpa kebutuhan mendesak yang membenarkannya.

### Keputusan yang Dipilih
Opsi 2 - REST Polling, perangkat memanggil endpoint backend secara langsung.

### Alasan Pemilihan
- Prototipe perangkat yang sudah dibangun oleh Tim IoT **telah berfungsi** menggunakan HTTP Polling (interval 15 detik) memanggil backend secara langsung - mengganti mekanisme ini ke Firebase RTDB berarti pekerjaan ulang firmware yang sudah berjalan, tanpa manfaat proporsional terhadap effort yang dikeluarkan.
- Keputusan awal (Firebase RTDB) dibuat tanpa memeriksa status implementasi aktual terlebih dahulu - begitu status ini diperiksa, REST Polling terbukti sudah menjadi solusi yang berfungsi, sehingga mempertahankannya lebih konsisten dengan prinsip Delivery > Complexity dibanding memaksakan migrasi ke pendekatan yang "lebih elegan" di atas kertas.

### Dampak Terhadap Sistem
- Kolom `firebase_ref_path` pada tabel `iot_devices` (ditambahkan berdasarkan keputusan sebelumnya) perlu **dihapus dari skema** - dicatat sebagai tindak lanjut, belum dieksekusi dalam ADR ini.
- Endpoint yang dipanggil perangkat untuk polling bersifat **device-facing**, bukan bagian dari kategori Public/Protected berbasis token pengguna (ADR-005) - perangkat tidak memiliki token JWT pengguna. Kebutuhan kategori akses ketiga (device-to-platform) perlu didefinisikan terpisah pada spesifikasi API.
- Interval polling 15 detik pada implementasi Tim IoT menetapkan batas bawah latensi: pembaruan level dari backend baru akan terdeteksi perangkat maksimal 15 detik kemudian - parameter ini perlu didokumentasikan sebagai Non-Functional Requirement yang sudah ditentukan oleh hardware, bukan oleh backend.

---

## ADR-014: Integrity Constraint pada Audit Trail Aktivasi Sirine

### Latar Belakang Keputusan
Dengan dua jalur aktivasi sirine (ADR-012), identitas operator hanya dapat diketahui secara digital pada jalur remote aplikasi (operator terautentikasi lewat token), sedangkan jalur lokal fisik tidak memiliki mekanisme identifikasi digital. Perlu dipastikan data yang tersimpan konsisten dengan kenyataan ini, bukan menyisakan ambiguitas.

### Alternatif yang Dipertimbangkan
1. Mengandalkan validasi di lapisan aplikasi saja untuk memastikan `operator_id` hanya terisi pada jalur remote.
2. Menegakkan aturan ini langsung di lapisan database melalui `CHECK` constraint.

### Keputusan yang Dipilih
Opsi 2 - `CHECK` constraint pada tabel `siren_action_log` yang mewajibkan `operator_id` terisi jika dan hanya jika `trigger_source = remote_aplikasi`.

### Alasan Pemilihan
- Validasi di lapisan aplikasi saja rentan terlewat apabila ada jalur penulisan data lain di masa depan (mis. skrip migrasi, integrasi baru) yang tidak melalui logika aplikasi yang sama.
- Menegakkan aturan di database menjadikannya berlaku universal, terlepas dari jalur mana pun data ditulis - konsisten dengan prinsip bahwa data yang menyangkut audit trail keselamatan tidak boleh bergantung pada disiplin implementasi semata.

### Dampak Terhadap Sistem
- Percobaan menyisipkan data yang melanggar aturan ini akan ditolak langsung oleh database dengan error constraint, bukan menghasilkan data tidak konsisten yang baru diketahui saat audit.
- Untuk aksi jalur lokal fisik, tidak tersedia audit trail identitas operator secara digital - ini adalah konsekuensi yang disadari dan diterima (lihat ADR-012), bukan kekurangan yang belum diketahui.

---

## ADR-015: Representasi Visual LED - Penggabungan Level Hijau dan Kuning

### Latar Belakang Keputusan
Status kesiapsiagaan memiliki 4 level (ADR-003), namun perangkat indikator fisik memiliki keterbatasan jumlah warna LED yang dapat ditampilkan secara jelas dan mudah dibedakan oleh warga di lapangan.

### Alternatif yang Dipertimbangkan
1. Menyediakan 4 warna LED berbeda untuk merepresentasikan keempat level secara visual berbeda satu sama lain.
2. Menggabungkan representasi visual level Hijau dan Kuning menjadi satu warna LED yang sama, sambil tetap membedakan Oranye dan Merah secara visual.

### Keputusan yang Dipilih
Opsi 2 - level Hijau dan Kuning ditampilkan dengan warna LED yang sama pada perangkat fisik. Level Oranye ditampilkan dengan warna LED tersendiri, diberi label eksplisit "Oranye" (bukan "Kuning") untuk mencegah kerancuan penamaan dengan level Kuning yang berbeda.

### Alasan Pemilihan
- Berdasarkan pertimbangan risiko, perbedaan kondisi antara Hijau (Aman) dan Kuning (Waspada) dinilai tidak cukup signifikan secara operasional di lapangan untuk membenarkan kebutuhan warna LED terpisah - keduanya sama-sama tidak memerlukan tindakan segera dari warga.
- Level Oranye dan Merah, sebaliknya, merepresentasikan kondisi yang memerlukan potensi tindakan (termasuk kemungkinan aktivasi sirine pada ADR-011) sehingga tetap wajib dibedakan secara visual secara jelas.
- Penggabungan ini adalah keputusan sadar pada **lapisan tampilan perangkat fisik saja** - tidak memengaruhi model data, yang tetap menyimpan dan membedakan keempat level secara penuh di backend (ADR-003 tidak berubah).

### Dampak Terhadap Sistem
- Dokumentasi hardware Tim IoT perlu diperbarui: label warna LED untuk level Oranye diganti dari "Kuning menyala" menjadi "Oranye menyala", untuk menghindari tabrakan penamaan dengan level Kuning.
- Dashboard web dan API tidak terpengaruh oleh penyederhanaan ini - keduanya tetap menampilkan dan membedakan keempat level secara eksplisit sesuai data yang tersimpan; penyederhanaan hanya berlaku pada tampilan LED fisik di lapangan.
