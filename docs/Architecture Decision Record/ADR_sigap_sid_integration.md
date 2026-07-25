# Architecture Decision Record - Integrasi SIGAP ↔ SID

| | |
|---|---|
| **Document Type** | Architecture Decision Record (ADR) |
| **Domain** | Cross-System Integration (SIGAP ↔ SID) |
| **Status** | Approved (SIGAP-side) - menunggu sign-off Tim SID & Architecture Working Group |
| **Version** | 1.0 |
| **Date** | 20 July 2026 |
| **Author** | Tech Lead, SIGAP |
| **Applies To** | `integration/SID_INTEGRATION_PROPOSAL.md` |

---

## ADR-022: Arah Integrasi - SIGAP sebagai Event Producer, SID sebagai Delivery Channel

### Latar Belakang Keputusan
Operator lapangan memerlukan notifikasi saat level kesiapsiagaan berubah, tanpa harus terus-menerus memantau dashboard SIGAP secara manual. SID telah memiliki infrastruktur Progressive Web App (PWA) dengan kapabilitas push notification yang sudah berjalan, sementara SIGAP belum memiliki mekanisme notifikasi ke perangkat pengguna.

### Alternatif yang Dipertimbangkan
1. SIGAP membangun sistem push notification sendiri (Web Push API native di SIGAP), independen dari sistem lain.
2. SIGAP memanfaatkan infrastruktur push notification SID yang sudah ada, dengan SIGAP mengirim event ke SID untuk diteruskan.
3. SID yang menarik (pull/poll) data status dari SIGAP secara berkala, alih-alih SIGAP mengirim (push) event ke SID.

### Keputusan yang Dipilih
Opsi 2 - SIGAP berperan sebagai *event producer*, mengirim event ke SID melalui API; SID berperan sebagai *delivery channel* yang meneruskan ke perangkat operator/warga yang berlangganan.

### Alasan Pemilihan
- Opsi 1 berarti membangun ulang kapabilitas yang secara fungsional sudah tersedia di SID - bertentangan dengan prinsip menghindari duplikasi effort antar sistem independen dalam program yang sama.
- Opsi 3 (SID melakukan pull) menambah latensi tidak perlu (SID harus menunggu jadwal polling berikutnya untuk mengetahui perubahan) dan membebani SIGAP dengan permintaan berulang dari sistem lain tanpa manfaat dibanding pola push.
- Pola push (SIGAP mengirim saat event terjadi) memberikan latensi notifikasi paling rendah dan paling sesuai dengan sifat mendesak dari perubahan level kesiapsiagaan.

### Dampak Terhadap Sistem
- SIGAP memerlukan komponen baru: pemanggil HTTP (HTTP client) yang mengirim event ke API SID setiap terjadi `level_change` atau `alert_validated` - dibangun di sisi SIGAP, tidak memerlukan perubahan pada domain lain SIGAP.
- SID tidak memerlukan akses ke database atau model data internal SIGAP - integrasi terbatas pada payload event dan target URL, menjaga independensi domain kedua sistem tetap utuh (prinsip arsitektur program: independent domain, database terpisah).
- Kegagalan pengiriman ke SID tidak boleh menghalangi proses inti SIGAP (pencatatan alert/level tetap berjalan meski pengiriman notifikasi gagal) - lihat ADR-025.

---

## ADR-023: Deep-Link Notifikasi Selalu Mengarah ke Dashboard SIGAP

### Latar Belakang Keputusan
Ketika SID mengirimkan notifikasi ke perangkat operator/warga, perlu ditentukan apa yang terjadi saat notifikasi tersebut diketuk (tap) - apakah membuka halaman di dalam SID, atau mengarahkan pengguna kembali ke SIGAP.

### Alternatif yang Dipertimbangkan
1. Notifikasi yang diketuk membuka halaman ringkasan di dalam aplikasi SID (SID menampilkan sebagian informasi alert).
2. Notifikasi yang diketuk mengarahkan (deep link) langsung ke halaman terkait di Dashboard SIGAP, dengan SID hanya bertindak sebagai perantara pengiriman.

### Keputusan yang Dipilih
Opsi 2 - setiap payload event yang dikirim ke SID menyertakan field `deep_link` yang menjadi tujuan navigasi saat notifikasi diketuk; SID tidak menampilkan maupun menyimpan konten informasi SIGAP.

### Alasan Pemilihan
- Opsi 1 menciptakan duplikasi tampilan data alert di dua sistem berbeda - berisiko kedua tampilan menjadi tidak sinkron seiring waktu (mis. status divalidasi di SIGAP tapi SID masih menampilkan versi lama).
- Mengarahkan pengguna kembali ke SIGAP mempertahankan SIGAP sebagai *single source of truth* untuk seluruh informasi kesiapsiagaan, sesuai peran SID yang murni sebagai kanal pengiriman notifikasi, bukan penyedia informasi kesiapsiagaan.

### Dampak Terhadap Sistem
- Setiap event yang dikirim ke SID wajib menyertakan `deep_link` yang valid - SIGAP bertanggung jawab membangun URL ini secara benar sebelum pengiriman, sesuai struktur routing frontend SIGAP.
- Struktur routing frontend SIGAP (untuk membangun `deep_link` yang benar) belum terdokumentasi secara resmi di manapun - dicatat sebagai gap dokumentasi yang perlu diselesaikan terpisah dari ADR ini, sebelum implementasi pengiriman event ke SID dapat berjalan penuh.

---

## ADR-024: Autentikasi Lintas Sistem - API Key Statis (Interim)

### Latar Belakang Keputusan
Panggilan dari SIGAP ke API SID memerlukan mekanisme autentikasi antar-sistem (machine-to-machine), berbeda dari autentikasi berbasis token pengguna (JWT) yang dipakai untuk API SIGAP sendiri. Standar autentikasi lintas sistem program secara resmi belum ditetapkan oleh Architecture Working Group pada saat proposal ini disusun.

### Alternatif yang Dipertimbangkan
1. Menunda seluruh proposal integrasi hingga Architecture Working Group menetapkan standar autentikasi lintas sistem resmi.
2. Mengusulkan skema autentikasi sederhana (API Key statis via header) sebagai titik mulai diskusi dengan Tim SID, dengan pemahaman eksplisit bahwa ini bersifat interim.

### Keputusan yang Dipilih
Opsi 2 - API Key statis dikirim melalui header `X-API-Key`, diprovisikan terpisah oleh masing-masing sistem, dengan catatan eksplisit bahwa skema ini akan menyesuaikan begitu standar resmi program tersedia.

### Alasan Pemilihan
- Menunggu standar resmi sebelum mengajukan proposal apa pun (opsi 1) berisiko menghambat kebutuhan notifikasi operator tanpa batas waktu yang jelas, mengingat belum ada linimasa pasti kapan Architecture Working Group akan menetapkan standar tersebut.
- Mengajukan skema konkret meski sederhana memberi Tim SID dan Architecture Working Group bahan diskusi nyata untuk disempurnakan, dibanding memulai diskusi dari nol.

### Dampak Terhadap Sistem
- Skema ini eksplisit ditandai sebagai usulan, bukan keputusan final, pada dokumen proposal - mencegah kesan bahwa SIGAP telah menetapkan standar autentikasi lintas sistem secara sepihak.
- Implementasi awal (jika disetujui Tim SID sebelum standar resmi tersedia) perlu dirancang agar mudah diganti mekanismenya di kemudian hari (mis. tidak menanamkan asumsi API Key statis secara mendalam pada logika bisnis).

---

## ADR-025: Dashboard SIGAP dan Indikator Fisik Tetap Sumber Kebenaran Utama

### Latar Belakang Keputusan
Notifikasi operator kini bergantung pada ketersediaan layanan SID sebagai kanal pengiriman (ADR-022). Perlu dipastikan kegagalan atau keterlambatan pada sisi SID tidak mengakibatkan hilangnya akses informasi kesiapsiagaan yang kritis bagi operator maupun warga.

### Alternatif yang Dipertimbangkan
1. Menjadikan notifikasi via SID sebagai satu-satunya mekanisme operator mengetahui perubahan level, tanpa jalur cadangan.
2. Mempertahankan Dashboard SIGAP dan indikator fisik IoT sebagai sumber kebenaran utama yang independen; notifikasi via SID diposisikan eksplisit sebagai kanal pelengkap (bukan satu-satunya jalur).

### Keputusan yang Dipilih
Opsi 2.

### Alasan Pemilihan
- Opsi 1 menciptakan titik kegagalan tunggal (single point of failure) pada sistem yang berkaitan langsung dengan keselamatan - jika SID tidak tersedia tepat saat kondisi kritis terjadi, operator berisiko tidak mendapat informasi sama sekali.
- Prinsip ini konsisten dengan fail-safe yang telah ditetapkan pada domain IoT (ADR-004): kegagalan satu komponen tidak boleh menciptakan kesan keliru bahwa situasi terkendali atau menyebabkan hilangnya informasi kritis.

### Dampak Terhadap Sistem
- SIGAP tetap mencatat seluruh event (`alert_log`, `device_status_log`, `siren_action_log`) secara independen dari status keberhasilan pengiriman ke SID - kegagalan pengiriman notifikasi tidak boleh menghasilkan pengecualian (exception) yang mengganggu proses pencatatan inti.
- Retry policy pengiriman ke SID belum ditentukan angkanya (didiskusikan bersama Tim SID berdasarkan kapasitas layanan mereka) - dicatat sebagai pertanyaan terbuka pada proposal integrasi, bukan diasumsikan sepihak oleh SIGAP.
