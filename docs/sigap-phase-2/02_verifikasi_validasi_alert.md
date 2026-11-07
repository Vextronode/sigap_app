# FS-02 - Verifikasi Alert

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Keputusan Terkait | ADR-034, ADR-036 |

## 1. Ringkasan

Admin dan operator meninjau alert yang dicatat otomatis oleh Decision Engine dan mengklasifikasikannya untuk pencatatan dan laporan. Notifikasi Web Push tidak menunggu klasifikasi.

## 2. Actor dan Akses

`admin`, `operator` (Protected, permission `alert.validate`).

## 3. Alur Fungsional

1. Decision Engine menulis alert baru ke tabel `alerts`.
2. Alert tampil di dashboard publik, dan Web Push dikirim ke seluruh subscriber.
3. Admin atau operator membuka daftar alert dan mengklasifikasikannya menjadi Dikonfirmasi, Ditolak, atau Ditindaklanjuti. Nilai awal adalah Belum Ditinjau.

## 4. Functional Requirements

- FR1: Menampilkan daftar alert dengan filter level, status review, dan rentang waktu, serta paginasi.
- FR2: Menampilkan detail alert (sumber, level, pesan, waktu).
- FR3: Mengubah status klasifikasi menjadi Dikonfirmasi, Ditolak, atau Ditindaklanjuti.
- FR4: Status `Ditolak` pada alert hasil estimasi atau gempa mengembalikan level yang berlaku ke `GREEN`.
- FR5: Status `Ditolak` tidak menurunkan alert dengan sumber `BMKG InaTEWS`.

## 5. Acceptance Criteria

- AC1: Alert baru muncul di daftar admin dan dashboard publik tanpa menunggu klasifikasi.
- AC2: Detail alert menampilkan seluruh field yang relevan.
- AC3: Perubahan status tersimpan beserta `reviewed_by` dan `reviewed_at`.
- AC4: Teks pada modal review menjelaskan dampak setiap pilihan terhadap level yang berlaku.
- AC5: Pengguna tanpa `alert.validate` ditolak dengan 403.

## 6. Edge Case dan Error Handling

- Volume alert tinggi: daftar memakai paginasi.
- BMKG tidak dapat dijangkau: tidak menghasilkan alert baru; perilaku status mengikuti ADR-037.

## 7. Data Terkait

`alerts`, lihat `DD_environmental.md`.
