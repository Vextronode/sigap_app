# Architecture Decision Record - Cakupan Produk dan Kebijakan Alert

| | |
|---|---|
| **Document Type** | Architecture Decision Record (ADR) |
| **Domain** | Product Scope & Alert Policy |
| **Status** | Approved |
| **Version** | 1.0 |
| **Date** | 7 November 2026 |
| **Author** | Tech Lead, SIGAP |
| **Applies To** | `docs/PRD.md`, `docs/Rules_Alerts.md`, `docs/architecture/`, `apps/backend/src/` |

---

## ADR-031: Sumber Data Eksternal BMKG dan Open-Meteo

### Latar Belakang Keputusan
PRD v4.0 menetapkan BMKG, USGS, dan OpenWeatherMap sebagai sumber data. Implementasi hanya memakai BMKG untuk gempa, tsunami, dan prakiraan, serta Open-Meteo untuk cuaca. USGS dan OpenWeatherMap tidak pernah dipanggil.

### Alternatif yang Dipertimbangkan
1. Membangun integrasi USGS dan OpenWeatherMap sesuai PRD v4.0.
2. Menetapkan BMKG dan Open-Meteo sebagai sumber data.

### Keputusan yang Dipilih
Opsi 2.

### Alasan Pemilihan
BMKG adalah sumber resmi untuk wilayah Indonesia dan mencukupi kebutuhan gempa serta tsunami. Open-Meteo sudah berjalan untuk cuaca tanpa kredensial berbayar. Menambah USGS dan OpenWeatherMap tidak memberi manfaat yang sebanding dengan biaya pemeliharaannya.

### Dampak Terhadap Sistem
Seluruh dokumen memakai BMKG dan Open-Meteo. Rancangan `environmental_data` pada `sigap-phase-2/planned_data_model.md` mengikuti dua sumber ini.

---

## ADR-032: Cakupan Evakuasi - Titik dan Navigasi Google Maps

### Latar Belakang Keputusan
PRD v4.0 mencantumkan jalur evakuasi pada peta beserta CRUD-nya. Implementasi menyediakan titik evakuasi, pengurutan titik terdekat, dan navigasi melalui Google Maps.

### Alternatif yang Dipertimbangkan
1. Membangun jalur evakuasi tergambar dan pengelolaannya.
2. Menetapkan titik evakuasi dan navigasi Google Maps sebagai cakupan.

### Keputusan yang Dipilih
Opsi 2. Peta memakai Leaflet dengan tile Google Maps.

### Alasan Pemilihan
Kondisi yang berjalan sudah memungkinkan warga mencapai titik evakuasi dengan rute dari lokasi mereka sendiri.

### Dampak Terhadap Sistem
Metrik UAT pada PRD diukur terhadap penemuan titik evakuasi terdekat. `GET /api/public/evacuation-routes` mengembalikan daftar kosong.

---

## ADR-033: Data Historis Lingkungan dan Alert Cuaca Dipindahkan ke Roadmap

### Latar Belakang Keputusan
PRD v4.0 menempatkan grafik data historis serta alert banjir, kekeringan, dan cuaca ekstrem pada MVP. Keduanya belum diimplementasikan, dan rancangan awalnya masih mengacu pada sumber data yang sudah tidak dipakai.

### Keputusan yang Dipilih
Keduanya dipindahkan ke Area 6 pada `sigap-phase-2/ROADMAP_TAHAP_2.md`, dengan rancangan yang ditinjau terhadap kondisi saat ini.

### Alasan Pemilihan
Riwayat gempa dan alert sudah tersedia. Alert cuaca memerlukan sumber klasifikasi resmi yang belum ditetapkan, sehingga tidak dapat dibangun tanpa melanggar prinsip SIGAP untuk tidak membuat ambang bahaya sendiri.

### Dampak Terhadap Sistem
Decision Engine tetap hanya mengevaluasi gempa dan tsunami.

---

## ADR-034: Web Push Langsung ke Seluruh Subscriber Tanpa Validasi Manual

### Latar Belakang Keputusan
Rules_Alerts v1.2 mengatur level Waspada dan Siaga dikirim ke perangkat desa dan menunggu validasi, sedangkan warga menerima notifikasi pada level Awas. Implementasi mengirim Web Push ke seluruh subscriber untuk setiap level selain Aman, tanpa validasi manual. Subscription bersifat anonim per browser, sehingga sistem tidak dapat membedakan perangkat desa dari warga.

### Alternatif yang Dipertimbangkan
1. Membangun segmentasi penerima dan alur validasi sesuai Rules_Alerts v1.2.
2. Meresmikan pengiriman langsung ke seluruh subscriber.

### Keputusan yang Dipilih
Opsi 2.

### Alasan Pemilihan
Warga tidak memiliki akun, dan validasi manual menambah jeda pada informasi yang sensitif terhadap waktu.

### Dampak Terhadap Sistem
Rules_Alerts v2.0 mencatat aturan ini. Review alert bersifat klasifikasi setelah notifikasi terkirim. Integrasi SID pada ADR-022 sampai ADR-025 dapat menjadi kanal tambahan.

---

## ADR-035: Filter Relevansi Gempa 100 km dan 7 Hari, Masa Aktif Alert 24 Jam

### Latar Belakang Keputusan
Rules_Alerts v1.2 mencatat filter relevansi 150 km dan 14 hari, sedangkan implementasi memakai 100 km dan 7 hari. Implementasi juga memiliki masa aktif alert 24 jam yang belum terdokumentasi.

### Alternatif yang Dipertimbangkan
1. Mengubah implementasi menjadi 150 km dan 14 hari.
2. Menetapkan 100 km dan 7 hari.

### Keputusan yang Dipilih
Opsi 2. Masa aktif alert gempa 24 jam dicatat sebagai aturan.

### Alasan Pemilihan
Nilai 100 km dan 7 hari adalah perilaku yang berjalan dan telah dipakai tim.

### Dampak Terhadap Sistem
Rules_Alerts v2.0 mencatat nilai ini. Pra-filter 100 km pada `earthquake.service.ts` bernilai tetap, sehingga menaikkan `PANGANDARAN_RADIUS_KM` di atas 100 hanya berpengaruh pada gempa yang menyebut Pangandaran.

**Catatan implementasi:** pra-filter tersebut kemudian diubah agar mengikuti `PANGANDARAN_RADIUS_KM`, dengan nilai default tetap 100 km.

---

## ADR-036: Review Ditolak Tidak Menurunkan Status Tsunami Resmi

**Status implementasi:** disetujui, menunggu perubahan kode.

### Latar Belakang Keputusan
Saat ini review `Ditolak` membuat alert yang berlaku tampil sebagai `GREEN` untuk warga dan perangkat, termasuk alert yang berasal dari status tsunami resmi. Route review hanya memeriksa validitas token. Dokumen sebelumnya menyatakan review bersifat administratif.

### Alternatif yang Dipertimbangkan
1. Mempertahankan perilaku saat ini.
2. Menjadikan seluruh review murni administratif.
3. Membiarkan `Ditolak` berlaku untuk alert hasil estimasi dan gempa, namun tidak untuk status tsunami resmi, serta mewajibkan permission `alert.validate`.

### Keputusan yang Dipilih
Opsi 3.

### Alasan Pemilihan
Operator perlu dapat menangani alarm palsu dari hasil otomatis. Status resmi tidak boleh hilang dari tampilan warga akibat satu tindakan akun.

### Dampak Terhadap Sistem
`alert.service.ts` membedakan alert dengan sumber `BMKG InaTEWS`, `alert.route.ts` memakai `requirePermission("alert.validate")`, dan teks modal review disesuaikan. Dokumen formal diperbarui setelah kode berubah.

---

## ADR-037: Status UNKNOWN Saat Data Tidak Tersedia

**Status implementasi:** disetujui, menunggu perubahan kode.

### Latar Belakang Keputusan
Saat database dan BMKG sama-sama gagal, sistem menampilkan `GREEN` dengan pesan kondisi aman, dan nilai tersebut diteruskan ke perangkat. Hal ini bertentangan dengan prinsip fail-safe pada ADR-004.

### Alternatif yang Dipertimbangkan
1. Mempertahankan `GREEN`.
2. Menampilkan level terakhir yang diketahui.
3. Menambahkan status `UNKNOWN`.

### Keputusan yang Dipilih
Opsi 3.

### Alasan Pemilihan
Ketiadaan data bukan bukti kondisi aman. Status tersendiri mencegah rasa aman yang keliru dan dapat dibedakan oleh warga maupun perangkat.

### Dampak Terhadap Sistem
Backend, frontend, dan payload `GET /api/public/device/status` menangani nilai `UNKNOWN`. `UNKNOWN` bukan nilai enum tersimpan karena hanya menggambarkan kondisi saat data tidak tersedia. Firmware perlu mengenali nilai ini, sehingga perubahannya dikoordinasikan dengan kontrak perangkat.

---

## ADR-038: Hosting Staging di Server Organisasi

### Latar Belakang Keputusan
Hosting sebelumnya berstatus TBD, dengan lingkungan sementara di Vercel yang sudah dinonaktifkan pada 1 November 2026.

### Keputusan yang Dipilih
Hosting dilakukan di staging server organisasi (Akademik Kampus) dengan Docker Compose, scheduler di dalam proses backend, dan reverse proxy milik pengelola server.

### Alasan Pemilihan
Proses backend yang berjalan terus menghilangkan kebutuhan pemicu cron eksternal, dan database berada dalam stack yang sama.

### Dampak Terhadap Sistem
Topologi dicatat pada `architecture/08_deployment_view.md`. Hosting production belum ditetapkan.

---

## ADR-040: Level Akhir Mengambil yang Tertinggi antara Tsunami dan Gempa

### Latar Belakang Keputusan
Decision Engine sebelumnya berhenti pada status tsunami selain `NORMAL`. Estimasi tsunami dibatasi `WASPADA`, sehingga gempa berpotensi tsunami yang juga dirasakan warga hanya menghasilkan `YELLOW`, padahal aturan gempa yang dirasakan menghasilkan `ORANGE`.

### Alternatif yang Dipertimbangkan
1. Mempertahankan status tsunami sebagai penentu tunggal.
2. Mengambil level tertinggi antara tsunami dan gempa.

### Keputusan yang Dipilih
Opsi 2. Bila level sama, sumber dan deskripsi tsunami yang dipakai. Bila level gempa lebih tinggi, deskripsi tsunami disertakan pada alert.

### Alasan Pemilihan
Status yang lebih rendah tidak boleh menutupi kondisi yang lebih tinggi. Batas `WASPADA` pada estimasi tsunami tetap berlaku, karena kenaikan ke `ORANGE` berasal dari laporan `Dirasakan` BMKG, bukan dari estimasi.

### Dampak Terhadap Sistem
`decisionEngine.service.ts` mengevaluasi tsunami dan gempa terpisah. Level `RED` tetap hanya berasal dari `BMKG_TSUNAMI_STATUS`.

---

## ADR-041: Review Alert Sebagai Catatan Pasca-Kejadian

Menggantikan ADR-036.

### Latar Belakang Keputusan
Review alert awalnya dirancang sebagai persetujuan sebelum broadcast untuk level tinggi. Persetujuan itu tidak efektif karena menunda peringatan, sehingga notifikasi dikirim otomatis (ADR-034) dan review kehilangan fungsi utamanya. Pada implementasi, `Dikonfirmasi` dan `Ditindaklanjuti` hanya mencatat label. `Ditolak` menurunkan level ke `GREEN` hanya sampai siklus scheduler berikutnya, lalu kondisi yang sama membuat alert baru dan mengirim push ulang. Dashboard admin menempatkan review sebagai tugas yang menunggu, dan modalnya menampilkan pesan aktivasi sirine tanpa perintah yang benar-benar dikirim.

### Alternatif yang Dipertimbangkan
1. Review sebagai catatan pasca-kejadian yang tidak mengubah level.
2. Menyembunyikan seluruh aksi review lewat konfigurasi.
3. Membuat `Ditolak` berfungsi penuh dengan penandaan per kejadian gempa.
4. ADR-036: `Ditolak` berlaku untuk alert hasil estimasi dan gempa, tidak untuk status tsunami resmi.

### Keputusan yang Dipilih
Opsi 1. Status review hanya mencatat tinjauan dan tidak memengaruhi level, notifikasi, maupun perangkat. Aksi review berada di halaman Riwayat Alert. Dashboard admin tidak lagi menampilkan aksi, antrean, atau badge verifikasi. Route review memakai permission `alert.validate`.

### Alasan Pemilihan
SIGAP meneruskan data BMKG, sehingga menolak data tersebut bukan peran operator. Estimasi tsunami sudah dibatasi `WASPADA`, sehingga risiko alarm palsu berat sudah kecil. Jejak penanganan tetap tersimpan untuk laporan pasca-kejadian.

### Dampak Terhadap Sistem
- Operator tidak memiliki cara menurunkan alert secara manual. Alert berakhir mengikuti masa aktif 24 jam.
- Komponen `DoubleConfirmationModal` tidak lagi ditampilkan dan tetap disimpan di kode, tanpa opsi sirine.
- Kontrol sirine dari aplikasi tetap mengikuti FS-09 dan belum tersedia.

---

## ADR-042: Estimasi Tsunami Mengikuti Masa Aktif Alert 24 Jam

### Latar Belakang Keputusan
Estimasi tsunami memakai filter umur gempa relevan 7 hari, sedangkan alert yang tersimpan berlaku 24 jam. Gempa berpotensi tsunami dapat memicu alert baru dan push ulang setiap 24 jam selama 7 hari.

### Keputusan yang Dipilih
Estimasi `WASPADA` hanya berlaku selama gempa berumur paling lama 24 jam.

### Alasan Pemilihan
Satu kejadian tidak boleh menghasilkan notifikasi berulang. Masa aktif yang sama dengan alert gempa membuat perilaku level konsisten.

### Dampak Terhadap Sistem
`GET /api/public/tsunami/status` mengembalikan `NORMAL` setelah 24 jam. Status dari `BMKG_TSUNAMI_STATUS` tidak terpengaruh. Data gempa tetap tampil pada kartu gempa sampai batas umur 7 hari.
