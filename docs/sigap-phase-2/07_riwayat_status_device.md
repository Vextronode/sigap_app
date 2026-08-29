# FS-07 — Riwayat Status Device

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract), FS-06 (Manajemen Perangkat IoT) |
| Status | Draft |
| Referensi | PRD.md §7 (`device_status_log`), §7 catatan v4.0 |

## 1. Ringkasan

Log riwayat setiap kali platform mengirim level indikator ke suatu perangkat (protokol REST Polling — Final, lihat PRD §7.1), termasuk status acknowledgment dari perangkat. Read-only bagi admin.

## 2. Actor & Akses

`admin`, `operator` (Protected, read-only).

## 3. Alur Fungsional

1. Setiap kali backend mengirim `current_level` baru ke perangkat, sistem mencatat entri baru di `device_status_log`.
2. Admin membuka riwayat, dapat memfilter per perangkat dan rentang waktu.
3. Admin melihat apakah pengiriman level ter-acknowledge oleh perangkat (`ack_status`).

## 4. Functional Requirements

- FR1: List riwayat status per perangkat, urut terbaru.
- FR2: Filter berdasarkan `device_id` dan rentang waktu (`sent_at`).
- FR3: Menampilkan `ack_status` per entri secara jelas (mis. terkirim / diterima / gagal).

## 5. Acceptance Criteria

- AC1: Setiap perubahan `current_level` pada suatu perangkat menghasilkan entri baru di log, tidak menimpa entri sebelumnya.
- AC2: Filter per perangkat menampilkan hanya entri milik perangkat tersebut.
- AC3: Entri dengan `ack_status` gagal tervisualisasi berbeda (mis. badge merah) agar admin bisa mengenali perangkat bermasalah tanpa membaca detail satu per satu.

## 6. Edge Case & Error Handling

- Volume log besar seiring waktu (polling reguler) — perlu pagination, tidak load seluruh riwayat sekaligus.
- Entri tanpa `ack_status` (perangkat tidak pernah merespons) — ditampilkan sebagai status "tidak diketahui/pending", bukan dianggap gagal secara otomatis.

## 7. Data Terkait

`device_status_log (id, device_id, level_sent, sent_at, ack_status)`

## 8. Dependency & Catatan Terbuka

Fitur ini murni read-only atas data yang dihasilkan proses backend REST Polling (di luar scope admin panel itu sendiri) — tidak ada aksi tulis dari fitur ini.
