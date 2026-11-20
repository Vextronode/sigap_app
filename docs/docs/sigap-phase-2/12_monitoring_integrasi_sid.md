# FS-12 — Monitoring Integrasi SID

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 4 (Integrasi SID) |

## 1. Ringkasan

Log status pengiriman notifikasi dari SIGAP ke SID (kanal tambahan di samping Web Push) agar kegagalan kanal notifikasi terlihat oleh admin — bukan diam-diam gagal di backend.

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

- SID API down berkepanjangan (bukan gangguan sesaat) — log menumpuk entri gagal; perlu ambang/alert khusus untuk kondisi ini . Ambang kondisi ini ditetapkan bersama kontrak API SID.

## 7. Data Terkait

Tabel log pengiriman ke SID ditetapkan bersama kontrak API SID.

## 8. Dependency

Area 4 pada `ROADMAP_TAHAP_2.md`.
