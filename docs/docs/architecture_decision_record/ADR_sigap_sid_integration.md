# Architecture Decision Record - Integrasi SIGAP ↔ SID

| | |
|---|---|
| **Document Type** | Architecture Decision Record (ADR) |
| **Domain** | Cross-System Integration (SIGAP ↔ SID) |
| **Status** | Approved (SIGAP-side) - menunggu sign-off Tim SID & Architecture Working Group |
| **Version** | 1.0 |
| **Date** | 20 July 2026 |
| **Author** | Tech Lead, SIGAP |
| **Applies To** | `docs/architecture/07_integration_architecture.md` |

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

---

## ADR-049: Peringatan Bencana SIGAP Dikirim ke SIDUTama Mengikuti Kontrak Integrasi v1

### Latar Belakang Keputusan
ADR-022 sampai ADR-024 disusun sebelum kontrak API SID tersedia dan sebelum SIGAP memiliki Web Push sendiri (ADR-034). Tim SIDUTama kemudian menetapkan kontrak integrasi v1: `PUT /alerts/{external_id}` untuk membuat atau memperbarui peringatan, `POST /alerts/{external_id}/end` untuk mengakhiri, dan `GET /ping` untuk tes koneksi, dengan Bearer token Sanctum ber-ability `alerts:write` dan batas 60 request per menit. SID menampilkan peringatan sebagai bar di halaman publik dan mengirim notifikasi ke akun warga hanya untuk peringatan baru dan kenaikan level; SID tidak mengubah isi peringatan. Warga yang memakai SID perlu menerima peringatan yang sama dengan subscriber Web Push SIGAP.

### Alternatif yang Dipertimbangkan
1. Mengikuti ADR-022 sampai ADR-024 apa adanya: SID sebagai satu-satunya kanal notifikasi, payload `deep_link`, dan header `X-API-Key`.
2. SID sebagai kanal tambahan di samping Web Push, mengikuti kontrak v1, dengan isi dan siklus peringatan diturunkan dari keputusan alert SIGAP.
3. Peringatan ke SID disusun dengan judul dan arahan tersendiri yang berbeda dari notifikasi push SIGAP.

### Keputusan yang Dipilih
Opsi 2:
- Scheduler meneruskan setiap keputusan alert ke SID melalui antrean, terpisah dari pengiriman Web Push.
- Judul dan pesan sama persis dengan notifikasi push SIGAP.
- Satu `external_id` per kejadian: `gempa-<awal rentetan>` dan `tsunami-<waktu kejadian>`. Alert baru, level naik, level turun, dan perpanjangan dikirim sebagai `PUT` ke id yang sama.
- `expires_at` mengikuti masa aktif alert SIGAP; status tsunami resmi yang tidak memiliki batas masa aktif dikirim dengan `expires_at` 24 jam sejak dikirim.
- `/end` dikirim satu kali per id saat kondisi aman terkonfirmasi, dengan syarat yang sama dengan notifikasi kembali aman (ADR-043, ADR-047).
- Pengulangan: timeout 10 detik, jeda 30 detik, 2 menit, dan 5 menit. 401, 403, dan 422 tidak diulang; 404 pada `/end` dianggap selesai; 429 mengikuti `Retry-After`.
- `link_url` mengarah ke dashboard warga SIGAP pada domain `SIGAP_PUBLIC_BASE_URL`.

### Alasan Pemilihan
- Opsi 1 tidak sesuai kontrak yang disepakati Tim SIDUTama dan menghapus Web Push SIGAP yang sudah berjalan.
- Opsi 3 menghasilkan dua versi pesan untuk satu kejadian dan menambah aturan isi yang tidak ditetapkan di `Rules_Alerts.md`.
- Isi yang sama dan id per kejadian menjaga SIGAP sebagai sumber kebenaran (ADR-023, ADR-025): SID hanya menampilkan dan meneruskan.
- `/end` bersifat final di SID, sehingga hasil `GREEN` karena data BMKG gagal diambil tidak boleh mengakhiri peringatan.

### Dampak Terhadap Sistem
- ADR-022, ADR-023, dan ADR-024 digantikan ADR ini. ADR-025 tetap berlaku; pertanyaan terbuka tentang retry policy terjawab oleh nilai di atas.
- Integrasi aktif bila `SID_INTEGRATION_ENABLED`, `SID_API_BASE_URL`, dan `SID_API_TOKEN` terisi; token hanya disimpan di environment backend.
- Notifikasi di SID tidak selalu sama dengan push SIGAP: kenaikan magnitudo pada level yang sama dan kembali aman tidak menghasilkan notifikasi SID, karena aturan notifikasi ditentukan SID.
- Antrean dan daftar `external_id` aktif disimpan di memori proses. Setelah restart, peringatan yang belum diakhiri berhenti tampil di SID saat `expires_at` habis.
- Status tsunami resmi masih mendapat id baru setiap pengingat harian (ADR-045); id tetap ditetapkan saat integrasi InaTEWS diaktifkan.
