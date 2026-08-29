# FS-08 - Riwayat Aktivasi Sirine

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract), FS-09 (Trigger Sirine) |
| Status | Final |
| Referensi | PRD.md S7 (catatan v4.0), S5.5 (NFR Keamanan Jalur Aktuasi Fisik), Dokumentasi_Sistem_IoT_SIGAP.md |

## 1. Ringkasan

Audit trail insert-only untuk setiap aktivasi sirine (Unit Utama di Kantor Desa → Sirine/Toa), mencakup jalur digital (dashboard) maupun fisik (tombol di Unit Utama), lengkap dengan status konfirmasi eksekusi dari perangkat.

## 2. Actor & Akses

`admin`, `operator` (Protected, read-only - tidak ada endpoint update/delete untuk tabel ini bagi role manapun, termasuk `admin`).

## 3. Alur Fungsional

1. Trigger terjadi (fisik di Unit Utama, atau digital dari dashboard via FS-09) → Unit Utama broadcast perintah ke Sirine via ESP-NOW.
2. Sirine mengirim status ack balik ke Unit Utama via ESP-NOW (diterima & dieksekusi, atau tidak ada respons dalam window tertentu).
3. Unit Utama melaporkan hasil (trigger + ack) ke backend pada siklus poll/heartbeat berikutnya.
4. Backend menulis satu entri baru ke `siren_action_log` - entri tidak pernah diubah/dihapus setelah tercatat.
5. Admin membuka riwayat, dapat memfilter berdasarkan sumber trigger dan rentang waktu.

## 4. Functional Requirements

- FR1: List riwayat aktivasi sirine, urut terbaru, insert-only (tidak ada aksi edit/hapus di UI maupun API).
- FR2: Setiap entri mencatat: level saat dipicu (4-tier), waktu trigger diminta, waktu eksekusi dilaporkan, sumber trigger, status ack, identitas pemicu (jika digital), IP pemicu (jika digital).
- FR3: Entri dengan `trigger_source = fisik` mencatat `triggered_by = null` (tidak ada identitas individu untuk tombol fisik).
- FR4: Backend menolak seluruh request modifikasi terhadap tabel ini di level API, terlepas dari role.

## 5. Acceptance Criteria

- AC1: Aktivasi via digital menghasilkan entri dengan identitas akun (`triggered_by`) dan IP (`triggered_from_ip`) yang jelas.
- AC2: Aktivasi via fisik menghasilkan entri dengan `triggered_by = null`, `triggered_from_ip = null`, `trigger_source = fisik`.
- AC3: Ack dari Sirine yang tidak diterima dalam window waktu tertentu (mis. 2× interval heartbeat) → `ack_status = Tidak Ada Respons`, bukan dianggap gagal total (bisa jadi hanya delay pelaporan).
- AC4: Riwayat dapat difilter per sumber trigger (digital/fisik) dan rentang waktu.
- AC5: Percobaan request update/delete langsung ke API terhadap entri manapun → ditolak (403/405), tidak ada mekanisme apa pun yang mengubah entri setelah tercatat.

## 6. Edge Case & Error Handling

- Command digital dibatalkan otomatis karena level berubah sebelum eksekusi (lihat FS-09 S4) → tetap dicatat sebagai entri dengan `trigger_source = dibatalkan_otomatis`, bukan dihilangkan dari log - supaya histori percobaan trigger tetap lengkap untuk audit.
- Sirine offline total saat trigger dikirim → entri tetap tercatat dengan `ack_status = Tidak Ada Respons`; ini justru sinyal penting bagi admin untuk segera cek fisik.

## 7. Data Terkait

`siren_action_log`:
- `id`
- `level_at_trigger` - enum 4-tier: GREEN/YELLOW/ORANGE/RED
- `triggered_at` - waktu command diminta (klik digital atau tekan fisik terdeteksi Unit Utama)
- `executed_at` - waktu broadcast benar-benar dilaporkan tereksekusi oleh Unit Utama (bisa lebih lambat dari `triggered_at` untuk jalur digital, mengikuti siklus poll)
- `trigger_source` - enum: `digital` / `fisik` / `dibatalkan_otomatis`
- `triggered_by` - nullable, akun admin/operator (hanya untuk `digital`)
- `triggered_from_ip` - nullable (hanya untuk `digital`)
- `ack_status` - enum: `Diterima & Dieksekusi` / `Tidak Ada Respons` / `Menunggu`
- `cooldown_overridden` - boolean, true jika trigger ini memotong cooldown karena eskalasi ke RED (lihat FS-09 S4)

## 8. Dependency & Catatan Terbuka

- Kemampuan Sirine mengirim status ack periodik via ESP-NOW ke Unit Utama **perlu dikonfirmasi Tim IoT** dari sisi firmware - desain ini mengasumsikan itu feasible tanpa hardware tambahan (reuse link ESP-NOW yang sudah ada).
- Monitoring berkelanjutan (bukan hanya per-kejadian trigger) - konektivitas, kualitas sinyal, status daya - masuk cakupan FS-06 (saat ini *hold*), dicatat di sini sebagai dependensi data yang perlu diselaraskan saat FS-06 dilanjutkan.