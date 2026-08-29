# FS-09 — Trigger Sirine Remote

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | FS-06 (Manajemen Perangkat IoT), ADR-012 |
| Status | Kontrak API sudah ada — **fungsional menyusul** setelah jalur remote diimplementasikan |
| Referensi | PRD.md §3.1, §5.5 (NFR Keamanan Jalur Aktuasi Fisik), Dokumentasi_Sistem_IoT_SIGAP.md |

## 1. Ringkasan

Tombol di admin panel untuk memicu sirine perangkat tertentu dari jarak jauh (via aplikasi), sebagai pelengkap tombol fisik lokal. Keputusan aktivasi tetap sepenuhnya berada di tangan operator manusia terlatih — sistem tidak pernah memicu otomatis (prinsip final, PRD §1.4 poin 6 & §12).

## 2. Actor & Akses

`admin`, `operator` (Protected).

## 3. Alur Fungsional

1. Admin memilih perangkat dari daftar (FS-06), melihat `current_level` perangkat tersebut.
2. Jika level perangkat Kuning atau Merah, opsi trigger sirine remote aktif (safeguard yang sama seperti tombol fisik — level Hijau tidak dapat memicu, lihat Dokumentasi_Sistem_IoT_SIGAP.md §2).
3. Admin menekan trigger; untuk level Merah, sistem meminta **konfirmasi tambahan** sebelum eksekusi (mitigasi human-factor, PRD §5.5).
4. Perintah dikirim ke perangkat; hasil (berhasil/gagal) tercatat di FS-08.

## 4. Functional Requirements

- FR1: Opsi trigger hanya muncul/aktif saat `current_level` perangkat = Kuning atau Merah (safeguard by design, konsisten dengan safeguard tombol fisik).
- FR2: Level Merah wajib melalui langkah konfirmasi tambahan sebelum eksekusi — desain interaksi spesifik (mis. dialog konfirmasi kedua, re-entry password) **belum ditentukan** (PRD §5.5: "desain spesifik TBD").
- FR3: Setiap trigger yang berhasil dieksekusi menghasilkan entri di `siren_action_log` (lihat FS-08).
- FR4: Kegagalan pengiriman perintah (perangkat offline, dsb.) ditampilkan jelas ke admin, tidak diam-diam gagal.

## 5. Acceptance Criteria

- AC1: Trigger untuk perangkat berstatus Hijau → opsi tidak tersedia sama sekali di UI (bukan sekadar disabled tanpa penjelasan).
- AC2: Trigger level Merah → wajib melewati langkah konfirmasi kedua sebelum perintah terkirim.
- AC3: Trigger sukses → entri baru muncul di riwayat (FS-08) dengan identitas admin/operator yang memicu.
- AC4: Trigger ke perangkat offline → admin menerima pesan gagal yang jelas, tidak ada entri "berhasil" palsu di riwayat.

## 6. Edge Case & Error Handling

- Dua admin mencoba trigger perangkat yang sama nyaris bersamaan — perilaku spesifik (locking/race condition) **belum ditentukan**, perlu masuk Architecture Document (G3).
- Perangkat berubah level (mis. dari Merah ke Hijau) tepat saat admin sedang di layar konfirmasi — sistem sebaiknya re-validasi level saat eksekusi, bukan hanya saat tombol pertama ditekan.

## 7. Data Terkait

Menulis ke `siren_action_log` (lihat FS-08); membaca `iot_devices.current_level` (FS-06).

## 8. Dependency & Catatan Terbuka

**Perlu Klarifikasi (blocking untuk implementasi, bukan untuk desain UI awal):**
- Desain mekanisme konfirmasi tambahan level Merah — TBD, Tech Lead + Tim IoT, idealnya divalidasi dengan operator terlatih (PRD §7.1).
- Fungsional penuh menunggu jalur remote perangkat selesai diimplementasikan (kontrak API sudah ada, ADR-012) — fitur ini bisa dibangun di sisi admin panel lebih dulu dalam mode "siap pakai, menunggu backend perangkat", tapi tidak bisa di-UAT end-to-end sampai jalur remote perangkat jadi.
