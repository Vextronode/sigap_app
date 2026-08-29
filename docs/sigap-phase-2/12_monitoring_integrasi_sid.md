# FS-12 — Monitoring Integrasi SID

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 4 (Integrasi Notifikasi dengan SID) |
| Status | Draft — menunggu kontrak API SID final |
| Referensi | Roadmap §2.1 #5, §5.C item 13, §7 (Isu Terbuka: Kontrak API SID) |

## 1. Ringkasan

Log status pengiriman notifikasi dari SIGAP ke SID (kanal dual-channel: SID + Web Push, lihat Roadmap §2.1 #5) agar kegagalan kanal notifikasi terlihat oleh admin — bukan diam-diam gagal di backend.

## 2. Actor & Akses

`admin`, `operator` (Protected, read-only).

## 3. Alur Fungsional

1. Setiap notifikasi yang dikirim SIGAP ke SID dicatat statusnya: berhasil / gagal / retry.
2. Admin membuka log ini untuk memantau kesehatan integrasi.
3. Jika ada kegagalan berulang, admin dapat mengeskalasi ke Tech Lead (di luar sistem, prosedural).

## 4. Functional Requirements

- FR1: List log pengiriman notifikasi ke SID dengan status (berhasil/gagal/retry) dan waktu.
- FR2: Filter berdasarkan status dan rentang waktu.
- FR3: Menampilkan jumlah percobaan retry per notifikasi yang gagal di percobaan pertama.

## 5. Acceptance Criteria

- AC1: Notifikasi yang gagal terkirim ke SID menghasilkan entri berstatus gagal, bukan hilang tanpa jejak.
- AC2: Retry otomatis (jika ada mekanismenya) tercatat sebagai entri terkait, bukan entri independen yang membingungkan urutan kejadian.
- AC3: Admin dapat membedakan dengan jelas notifikasi yang akhirnya berhasil setelah retry vs yang gagal permanen.

## 6. Edge Case & Error Handling

- SID API down berkepanjangan (bukan gangguan sesaat) — log menumpuk entri gagal; perlu ambang/alert khusus untuk kondisi ini — **Perlu Klarifikasi**, belum ditentukan di dokumen sumber.

## 7. Data Terkait

Entitas log pengiriman notifikasi SID — struktur field belum tercantum eksplisit di PRD §7 (Data Model saat ini fokus ke IoT), perlu ditambahkan di Data Dictionary (G2) bersamaan dengan finalisasi kontrak API SID (Area 4).

## 8. Dependency & Catatan Terbuka

**Blocking:** fitur ini baru bisa fungsional penuh setelah Area 4 (kontrak API SID final + autentikasi resmi, menggantikan API Key interim ADR-024) selesai — lihat Roadmap §7 (Isu Terbuka: "Kontrak API SID... menunggu sign-off Tim SID").
