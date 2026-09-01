# FS-02 - Verifikasi & Validasi Alert

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract), Area 2 (Otomasi Status & Notifikasi) |
| Status | Final (skema verifikasi) - menunggu implementasi Area 1/2 |
| Referensi | PRD.md S3.1, S7 (`alert_log`), Roadmap S2.1 #6 (Rule Engine), Dokumentasi_Sistem_IoT_SIGAP.md |

## 1. Ringkasan

Admin meninjau alert yang tercatat otomatis oleh Rule Engine (klasifikasi resmi BMKG dipetakan ke `status_level` - satu-satunya sumber alert saat ini, keputusan final) dan mengklasifikasikannya untuk kebutuhan pencatatan/laporan. Klasifikasi ini **murni administratif** - tidak menggerbang tampilan alert ke publik (tetap realtime) maupun ketersediaan tombol trigger sirine (FS-09), yang sepenuhnya diatur oleh level perangkat itu sendiri (Kuning/Merah), sejalan dengan safeguard fisik yang sudah ada di Alat 1 (Dokumentasi_Sistem_IoT_SIGAP.md S2).

## 2. Actor & Akses

`admin`, `operator` (Protected) - keduanya dapat mengubah status tinjauan.

## 3. Alur Fungsional

1. Rule Engine menulis entri baru ke `alert_log` berdasarkan klasifikasi resmi BMKG.
2. Secara paralel: (a) alert tampil realtime di dashboard publik & kanal notifikasi, (b) `iot_devices.current_level` diperbarui dan diteruskan ke Alat 1 via REST Polling, mengaktifkan LED/buzzer lokal (skala kantor desa/balai desa, bukan seluruh wilayah) sesuai level.
3. Saat level Kuning/Merah, tombol trigger tersedia - baik fisik di Alat 1 maupun mirror di dashboard (FS-09). Menekan tombol memicu Alat 2 (sirine jarak jauh) sebagai tindakan validasi bahaya oleh manusia.
4. Terlepas dari kapan/apakah tombol ditekan, admin dapat membuka daftar alert dan mengklasifikasikannya menjadi salah satu dari: **Dikonfirmasi / Ditolak / Ditindaklanjuti** (default: *Belum Ditinjau*) - untuk kebutuhan pencatatan dan laporan pasca-kejadian, bukan syarat teknis apa pun.

## 4. Functional Requirements

- FR1: Menampilkan daftar `alert_log` dengan filter minimal berdasarkan severity dan rentang waktu.
- FR2: Menampilkan detail satu alert (sumber, tipe, severity, pesan, waktu trigger).
- FR3: Admin/operator dapat mengubah status klasifikasi alert menjadi Dikonfirmasi / Ditolak / Ditindaklanjuti.
- FR4: Klasifikasi status **tidak memengaruhi** visibilitas alert ke publik maupun ketersediaan tombol trigger sirine (FS-09) - keduanya independen dari fitur ini.

## 5. Acceptance Criteria

- AC1: Alert baru dari Rule Engine muncul di daftar admin & dashboard publik secara realtime (mengikuti strategi refresh Roadmap S4 - SSE, bergantung prasyarat hosting), tanpa menunggu klasifikasi apa pun.
- AC2: Admin dapat membuka detail alert dan melihat seluruh field relevan dari `alert_log`.
- AC3: Perubahan status klasifikasi tersimpan beserta audit (`reviewed_by`, `reviewed_at`) dan dapat dilihat kembali di histori.
- AC4: Tombol trigger di FS-09 tetap tersedia untuk perangkat berlevel Kuning/Merah terlepas dari status klasifikasi alert manapun (termasuk Belum Ditinjau atau Ditolak) - memastikan tidak ada langkah tambahan yang menghalangi validasi darurat.
- AC5: Alert diklasifikasikan **Ditolak** → tetap tampil apa adanya di dashboard publik (tidak dihapus/disembunyikan); ini keputusan sadar demi menjaga kesan realtime.

## 6. Edge Case & Error Handling

- Volume alert tinggi dalam waktu singkat - perlu pagination/virtualisasi list.
- BMKG API unreachable - tidak menghasilkan alert palsu; indikator "data terakhir diperbarui pada [waktu]" mengikuti NFR 5.4, berlaku sama di sisi admin.
- Tombol fisik di Alat 1 ditekan langsung di lapangan - backend **tidak mengetahui** kejadian ini secara realtime (jalur ESP-NOW Alat 1 → Alat 2 tidak melalui backend, lihat Dokumentasi_Sistem_IoT_SIGAP.md S3). Ini konsisten dengan catatan di FS-08: aktivasi via jalur fisik murni tidak punya audit trail digital.

## 7. Data Terkait

`alert_log (id, alert_type, severity, message, triggered_at)` + kolom baru (masuk Data Dictionary G2):
- `review_status` - ENUM: `Belum Ditinjau` (default) / `Dikonfirmasi` / `Ditolak` / `Ditindaklanjuti`
- `reviewed_by`, `reviewed_at`

## 8. Dependency & Catatan Terbuka

- Fitur ini **tidak lagi berdampak** ke FS-09 - keduanya independen (koreksi dari draft sebelumnya).
- Gap yang tetap disadari: `alert_log` belum punya field lokasi/area untuk menghubungkan alert ke perangkat spesifik. Tidak menjadi masalah untuk fitur ini karena klasifikasi bersifat administratif, tapi tetap relevan untuk FS-09 (lingkup satu area/desa).
- Sumber data alert dibatasi BMKG untuk saat ini (keputusan final, tidak dibahas ulang).