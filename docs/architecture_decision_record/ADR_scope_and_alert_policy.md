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

**Status implementasi:** diterapkan. Firmware perlu mengenali nilai ini mengikuti kontrak perangkat.

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

---

## ADR-043: Status UNKNOWN Saat BMKG Tidak Dapat Dijangkau

Memperluas ADR-037.

### Latar Belakang Keputusan
ADR-037 mencakup kondisi saat database dan BMKG sama-sama gagal. Bila hanya BMKG yang gagal dan database tetap hidup, sistem menampilkan rekaman terakhir, atau `GREEN` setelah rekaman berumur lebih dari 24 jam, sehingga dapat menyatakan aman tanpa data baru.

### Alternatif yang Dipertimbangkan
1. Mempertahankan `GREEN`.
2. Menampilkan `UNKNOWN` setiap kali BMKG gagal, termasuk saat ada alert aktif.
3. Menampilkan `UNKNOWN` hanya saat tidak ada alert aktif.

### Keputusan yang Dipilih
Opsi 3. Alert aktif yang berumur paling lama 24 jam tetap ditampilkan. Tanpa alert aktif, `GREEN` hanya berlaku bila minimal satu daftar gempa BMKG berhasil diambil.

### Alasan Pemilihan
Ketiadaan data bukan bukti kondisi aman. Sebaliknya, peringatan yang sudah tercatat tetap valid dan tidak boleh hilang karena gangguan pada sumber data.

### Dampak Terhadap Sistem
- `AlertService.getCurrentAlert` memeriksa ketersediaan BMKG saat tidak ada alert aktif, dengan hasil disimpan dalam cache 60 detik.
- Saat BMKG tidak merespons, permintaan yang memicu pemeriksaan dapat tertahan sekitar 12 detik, sesuai timeout dan retry pada `EarthquakeService`.
- Status dari `BMKG_TSUNAMI_STATUS` tetap menghasilkan alert aktif karena tidak bergantung pada BMKG.

---

## ADR-044: Respons Alert Publik Tanpa Data Peninjau dan Riwayat 30 Hari

### Latar Belakang Keputusan
Endpoint alert publik mengirim nama, email, id, dan role staf yang meninjau alert. Warga tidak memerlukan data tersebut. `GET /api/public/alerts/history` juga mengembalikan seluruh riwayat tanpa batas.

### Alternatif yang Dipertimbangkan
1. Memindahkan data peninjau ke query terpisah pada repository.
2. Menghapus data peninjau pada lapisan respons publik.

### Keputusan yang Dipilih
Opsi 2. Respons publik tidak memuat `reviewer` dan `reviewedBy`. Riwayat publik dibatasi 30 hari terakhir.

### Alasan Pemilihan
Data peninjau tetap diperlukan pada endpoint Protected, sehingga pemisahan pada lapisan respons cukup dan tidak mengubah repository. Batas 30 hari mengikuti kebutuhan warga melihat kejadian terkini.

### Dampak Terhadap Sistem
Riwayat lebih lama tetap tersedia melalui `GET /api/protected/alerts`.

---

## ADR-045: Masa Berlaku Alert Status Tsunami Resmi Mengikuti BMKG_TSUNAMI_STATUS

### Latar Belakang Keputusan
Seluruh alert berakhir setelah 24 jam, dan hasil `GREEN` tidak disimpan. Akibatnya, setelah `BMKG_TSUNAMI_STATUS` dikosongkan, warga dan perangkat tetap menerima status lama sampai 24 jam. Sebaliknya, selama status masih terisi, level sempat tampil `GREEN` setiap 24 jam sampai siklus scheduler berikutnya membuat alert baru.

### Alternatif yang Dipertimbangkan
1. Menyimpan hasil `GREEN` untuk menandai akhir setiap alert.
2. Menentukan masa berlaku alert status tsunami resmi dari `BMKG_TSUNAMI_STATUS`, dan mempertahankan 24 jam untuk alert gempa.

### Keputusan yang Dipilih
Opsi 2. Alert bersumber `BMKG InaTEWS` berlaku selama `BMKG_TSUNAMI_STATUS` sama dengan levelnya, tanpa batas umur. Alert gempa dan estimasi tsunami tetap berakhir setelah 24 jam. Selama status resmi masih berlaku, alert baru dan notifikasi tetap terbit setiap 24 jam sebagai pengingat.

### Alasan Pemilihan
Status resmi memiliki penanda berakhir yang jelas, yaitu perubahan variabel oleh operator. BMKG tidak mengirim penanda berakhir untuk gempa, sehingga batas 24 jam tetap diperlukan. Menyimpan `GREEN` akan mengisi riwayat dengan rekaman yang bukan kejadian.

### Dampak Terhadap Sistem
- Status `AWAS` yang masih berlaku tidak lagi sempat tampil `GREEN`.
- Saat status dikosongkan, level turun tanpa menunggu 24 jam, dan siklus scheduler berikutnya mengevaluasi ulang gempa yang masih aktif.
- Perubahan `BMKG_TSUNAMI_STATUS` memerlukan restart backend. Scheduler menjalankan satu siklus saat proses dimulai.
- Scheduler menganggap rekaman berumur lebih dari 24 jam bukan duplikat.

## ADR-046: Penyatuan Data Gempa per Kejadian dan Aturan Rentetan Gempa

### Latar Belakang Keputusan
`gempaterkini.json` memuat `Potensi` tanpa `Dirasakan`, sedangkan `gempadirasakan.json` memuat `Dirasakan` tanpa `Potensi`. Kedua daftar digabung tanpa penyatuan, sehingga gempa M5 ke atas yang dirasakan di sekitar Desa Cibenda terbaca tidak dirasakan dan menghasilkan `YELLOW`. Decision Engine juga hanya menilai satu gempa terbaru, sehingga gempa susulan kecil menurunkan level dan memicu alert serta notifikasi baru. Penentuan duplikat memakai teks deskripsi yang berubah setiap BMKG menambah wilayah `Dirasakan`, dan masa aktif alert dihitung dari waktu simpan, bukan waktu kejadian.

Gempa besar umumnya diikuti rentetan gempa susulan. Gempa susulan terbesar biasanya lebih kecil dari gempa utama, sedangkan gempa yang lebih besar dalam rentetan dapat menandakan gempa utama baru.

### Alternatif yang Dipertimbangkan
1. Mempertahankan penilaian satu gempa terbaru dan memperbaiki penggabungan feed saja.
2. Menilai seluruh gempa aktif dengan level tertinggi, lalu mengatur penyimpanan dan notifikasi per rentetan.
3. Opsi 2 dengan notifikasi untuk setiap gempa susulan.

Untuk gempa dengan level sama dalam rentetan, dipertimbangkan: memperpanjang alert tanpa notifikasi, menyimpan alert baru tanpa notifikasi, atau menerbitkan alert dan notifikasi bila magnitudo bertambah paling sedikit 1,0. Acuan selisih magnitudo dibandingkan antara gempa sebelumnya dan magnitudo yang terakhir dikirim notifikasi.

Untuk teks `Potensi` yang belum terverifikasi, dipertimbangkan: mencatat tanpa menebak, mencocokkan pola teks, atau menganggapnya `WASPADA`.

### Keputusan yang Dipilih
Opsi 2, dengan ketentuan:
- Ketiga feed disatukan per `DateTime`. Item dengan waktu, koordinat, atau magnitudo tidak valid tidak dipakai.
- Gempa relevan bila episentrum dalam radius, atau `Dirasakan` menyebut wilayah kata kunci desa berapa pun jaraknya, dicocokkan per nama wilayah.
- Level gempa adalah level tertinggi di antara gempa aktif. Masa aktif alert dihitung dari waktu kejadian terbaru pada level tersebut.
- Level naik menerbitkan alert dan notifikasi. Level turun menerbitkan alert tanpa notifikasi.
- Level sama menerbitkan alert dan notifikasi bila magnitudo terbesar pada level itu paling sedikit 1,0 di atas magnitudo yang terakhir dikirim notifikasi. Selain itu alert diperpanjang tanpa notifikasi.
- Hanya teks `Potensi` yang terverifikasi yang dikenali. Teks lain dicatat tanpa ditebak.

### Alasan Pemilihan
Penyatuan feed mengembalikan informasi `Dirasakan` dan `Potensi` yang selama ini terpisah. Level tertinggi dari gempa aktif mencegah penurunan level oleh gempa susulan kecil. Selisih 1,0 magnitudo, setara energi sekitar 32 kali, tidak tercapai oleh gempa susulan biasa sehingga warga tidak menerima notifikasi berulang, tetapi tetap diberi tahu bila muncul gempa yang jauh lebih besar. Acuan magnitudo yang terakhir dikirim notifikasi mencegah gempa yang jauh lebih besar terlewat karena kenaikan bertahap. Teks `Potensi` yang tidak ditebak menghindari klaim potensi tsunami tanpa dasar.

### Dampak Terhadap Sistem
- Tabel `alerts` memperoleh kolom `event_time`, `reference_magnitude`, `episode_started_at`, `episode_event_count`, dan `episode_max_magnitude`.
- Alert dapat diperbarui scheduler selama rentetan berlangsung.
- Gempa aktif diambil dari data live dan `earthquake_records` 24 jam terakhir. Kejadian baru atau berubah disimpan.
- Banner warga dan bar insiden admin menampilkan ringkasan rentetan bila gempa aktif lebih dari satu.
- Estimasi tsunami `WASPADA` belum dapat aktif sampai teks `Potensi` resmi untuk gempa berpotensi tsunami ditambahkan.
- Memperluas ADR-035, ADR-040, dan ADR-042. Alert status tsunami tetap mengikuti ADR-045.
