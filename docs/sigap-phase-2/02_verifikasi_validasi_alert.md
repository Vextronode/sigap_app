# FS-02 - Catatan Tinjauan Alert

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Keputusan Terkait | ADR-034, ADR-041 |

## 1. Ringkasan

Admin dan operator mencatat tinjauan alert untuk arsip dan laporan pasca-kejadian. Catatan tidak memengaruhi level, notifikasi, maupun perangkat.

## 2. Actor dan Akses

`admin`, `operator` (Protected, permission `alert.validate`).

## 3. Alur Fungsional

1. Decision Engine menulis alert baru ke tabel `alerts`.
2. Alert tampil di dashboard publik, dan Web Push dikirim ke seluruh subscriber.
3. Admin atau operator membuka Riwayat Alert dan dapat mencatat tinjauan sebagai Dikonfirmasi, Ditolak, atau Ditindaklanjuti. Nilai awal adalah Belum Ditinjau.

## 4. Functional Requirements

- FR1: Menampilkan daftar alert dengan filter level, status tinjauan, dan rentang waktu, serta paginasi.
- FR2: Menampilkan detail alert (sumber, level, pesan, waktu).
- FR3: Mencatat status tinjauan beserta peninjau dan waktunya.
- FR4: Status tinjauan tidak mengubah level yang berlaku, notifikasi, maupun data untuk perangkat.

## 5. Acceptance Criteria

- AC1: Alert baru muncul di Riwayat Alert dan dashboard publik tanpa menunggu tinjauan.
- AC2: Detail alert menampilkan seluruh field yang relevan.
- AC3: Perubahan status tersimpan beserta `reviewed_by` dan `reviewed_at`.
- AC4: Status `Ditolak` tidak mengubah level, dan siklus scheduler berikutnya tidak membuat alert maupun notifikasi ulang untuk kondisi yang sama.
- AC5: Pengguna tanpa `alert.validate` ditolak dengan 403.

## 6. Edge Case dan Error Handling

- Volume alert tinggi: daftar memakai paginasi.

## 7. Data Terkait

`alerts`, lihat `DD_environmental.md`.
