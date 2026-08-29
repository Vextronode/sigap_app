# FS-08 — Riwayat Aktivasi Sirine

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract), FS-09 (Trigger Sirine Remote) |
| Status | Draft — entitas `siren_action_log` belum resmi masuk Data Model |
| Referensi | PRD.md §7 (catatan v4.0), §5.5 (NFR Keamanan Jalur Aktuasi Fisik) |

## 1. Ringkasan

Audit trail siapa memicu sirine dan kapan — mencakup aktivasi via jalur remote (aplikasi) maupun pencatatan aktivasi via tombol fisik lokal bila datanya tersedia secara digital.

## 2. Actor & Akses

`admin`, `operator` (Protected, read-only).

## 3. Alur Fungsional

1. Saat sirine dipicu (via FS-09 remote, atau tombol fisik yang sinyalnya tercatat backend), sistem menulis entri ke `siren_action_log`.
2. Admin membuka riwayat, melihat: perangkat, level saat dipicu, waktu, jalur pemicu (remote/fisik — jika tercatat), dan siapa (untuk remote, terkait akun admin/operator yang login).

## 4. Functional Requirements

- FR1: List riwayat aktivasi sirine, urut terbaru.
- FR2: Setiap entri mencatat minimal: perangkat, waktu, level saat dipicu, jalur pemicu.
- FR3: Untuk aktivasi via remote (FS-09), entri menyertakan identitas akun yang memicu.

## 5. Acceptance Criteria

- AC1: Aktivasi sirine via remote menghasilkan entri baru dengan identitas admin/operator yang jelas.
- AC2: Riwayat dapat difilter per perangkat dan rentang waktu.

## 6. Edge Case & Error Handling

- Aktivasi via tombol fisik lokal murni (tanpa konektivitas jaringan) — **tidak menghasilkan audit trail digital** sama sekali (konsekuensi eksplisit di PRD §7 catatan v4.0). Fitur ini hanya mencakup jalur yang secara teknis dapat dicatat backend.

## 7. Data Terkait

`siren_action_log (id, device_id, level_at_trigger, triggered_at, trigger_source, triggered_by)` — struktur indikatif; entitas ini **belum resmi** tercantum di Data Model PRD §7 sebagai tabel final, statusnya "kemungkinan tabel terpisah" — perlu dikonfirmasi dan diformalkan di Data Dictionary (G2) sebelum development.

## 8. Dependency & Catatan Terbuka

**Perlu Klarifikasi (blocking):** field pasti tabel `siren_action_log` belum ditetapkan di dokumen sumber manapun. Ini adalah salah satu item yang secara eksplisit dicatat PRD §7.1 sebagai perlu disinkronkan ke Backlog Jira-Ready v2 (Epic/Story baru, estimasi SP belum masuk hitungan) — sinkronisasi ini juga berarti field tabel perlu difinalisasi bersamaan.
