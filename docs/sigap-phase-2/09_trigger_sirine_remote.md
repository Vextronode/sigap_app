# FS-09 - Trigger Sirine Remote

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | ADR-012, FS-08 (Riwayat Aktivasi Sirine) |
| Status | Final (skema) - fungsional menyusul implementasi jalur remote di firmware |
| Referensi | PRD.md S3.1, S5.5, Dokumentasi_Sistem_IoT_SIGAP.md |

## 1. Ringkasan

Tombol tunggal di dashboard admin untuk memicu Sirine (toa) dari jarak jauh. Karena topologi terpusat (1 Unit Utama, broadcast ke seluruh Sirine - saat ini 1 unit), **tidak ada pemilihan perangkat** - satu klik memicu seluruh jaringan sirine sekaligus, identik dengan menekan tombol fisik di Unit Utama. Aktivasi tetap sepenuhnya keputusan manusia (human-in-the-loop) - sistem tidak pernah memicu otomatis.

## 2. Actor & Akses

`admin`, `operator` (Protected).

## 3. Alur Fungsional

1. Dashboard menampilkan `current_level` Unit Utama saat ini (bukan per-perangkat - hanya satu level yang relevan, milik Unit Utama).
2. Tombol trigger aktif hanya saat `current_level` ∈ {ORANGE, RED}.
3. Level ORANGE: klik langsung mengirim command. Level RED: klik memunculkan modal konfirmasi kedua ("Ini akan membunyikan sirine di seluruh titik terpasang. Lanjutkan?") sebelum command terkirim.
4. Command dititipkan ke siklus polling Unit Utama (≤15 detik, ADR-013) - UI menampilkan disclaimer eksplisit soal latensi ini.
5. Unit Utama mengeksekusi broadcast ke Sirine, menerima ack, melaporkan hasil ke backend pada poll berikutnya → tercatat di FS-08.
6. Cooldown 60 detik dimulai sejak trigger tercatat berhasil - tombol (fisik maupun digital) terkunci selama itu, KECUALI level naik ke RED selama cooldown (eskalasi memotong cooldown, tombol terbuka lagi segera).

## 4. Functional Requirements

- FR1: Tombol trigger tunggal (bukan daftar perangkat) - aktif/nonaktif berdasarkan `current_level` Unit Utama.
- FR2: Level RED wajib melalui modal konfirmasi kedua sebelum command terkirim.
- FR3: Cooldown 60 detik ditegakkan di backend (bukan hanya UI) - request langsung ke API selama cooldown aktif tetap ditolak, kecuali kondisi eskalasi RED (FR5).
- FR4: Re-validasi `current_level` dilakukan ulang oleh backend tepat sebelum command dititipkan ke Unit Utama, dan oleh Unit Utama tepat sebelum broadcast dieksekusi - jika level sudah turun di bawah ORANGE di titik manapun, command dibatalkan otomatis dan dicatat (`trigger_source = dibatalkan_otomatis`, lihat FS-08).
- FR5: Eskalasi ke RED selama cooldown ORANGE sebelumnya masih berjalan → cooldown dipotong, tombol terbuka kembali segera.
- FR6: Kegagalan pengiriman (Unit Utama tidak merespons poll, atau Sirine tidak memberi ack) ditampilkan jelas ke admin - tidak ada indikasi "berhasil" palsu.

## 5. Acceptance Criteria

- AC1: `current_level` = GREEN/YELLOW → tombol trigger tidak tersedia sama sekali di UI.
- AC2: `current_level` = RED → klik pertama membuka modal konfirmasi; hanya klik kedua yang mengirim command.
- AC3: Command berhasil dieksekusi → entri baru di FS-08 dengan identitas & IP admin yang jelas, `ack_status` sesuai respons Sirine.
- AC4: Command dikirim saat cooldown aktif (dan bukan kondisi eskalasi RED) → ditolak di backend dengan pesan jelas ("Sirine baru saja diaktifkan, tunggu hingga [waktu] sebelum memicu ulang").
- AC5: Level naik ke RED saat cooldown ORANGE masih berjalan → tombol otomatis terbuka kembali, cooldown lama dianggap selesai.
- AC6: Level turun di bawah ORANGE saat command masih dalam antrean poll → command dibatalkan otomatis, dicatat di FS-08, admin diberi notifikasi ("Perintah dibatalkan karena kondisi sudah membaik").

## 6. Edge Case & Error Handling

- Unit Utama tidak merespons poll dalam waktu wajar (mis. WiFi desa mati) → command tetap tersimpan sebagai *pending* di backend, dieksekusi begitu Unit Utama kembali online dan poll berikutnya terjadi - **kecuali** level sudah berubah saat itu (berlaku FR4).
- Dua admin klik trigger nyaris bersamaan → cooldown menangani ini secara alami: siapa pun yang tercatat backend lebih dulu, yang kedua otomatis kena cooldown-reject (tidak perlu locking khusus tambahan).

## 7. Data Terkait

Menulis ke `siren_action_log` (FS-08); membaca `current_level` milik Unit Utama (bukan lagi per-`device_id`, karena tidak ada pemilihan perangkat).

## 8. Dependency & Catatan Terbuka

- **Perlu Klarifikasi (firmware, di luar cakupan admin panel):** mekanisme konfirmasi tambahan untuk tombol **fisik** di level RED - saya usulkan tekan-tahan 2 detik, tapi feasibility-nya wajib dikonfirmasi Tim IoT (firmware sudah tahap finishing). Jika tidak feasible, fisik tetap single-press untuk semua level aktif, mitigasi human-factor didorong lewat SOP operator.
- Fungsional penuh menunggu jalur remote Unit Utama↔backend selesai diimplementasikan (kontrak API sudah ada, ADR-012).