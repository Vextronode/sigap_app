# 9. Cross-Cutting Concerns

Bagian ini merangkum prinsip yang berulang di lebih dari satu domain — bukan keputusan baru, melainkan pola yang perlu dikenali sebagai satu kesatuan filosofi desain.

## 9.1 Fail-Safe by Design

| Domain | Penerapan | Status | ADR |
|---|---|---|---|
| IoT | Device offline tidak dianggap level "aman" | Desain final, implementasi menunggu migrasi `iot_devices` ke Prisma | ADR-004, ADR-030 |
| Integrasi SID | Kegagalan kirim notifikasi tidak menghentikan pencatatan inti SIGAP | N/A - integrasi belum dibangun | ADR-025 |
| Aktivasi Sirine | Hanya level ORANGE/RED yang membuka opsi aktivasi | Desain final (FS-09), implementasi dijadwalkan Sprint 3 Tahap 2 | ADR-011 |

## 9.2 Defense in Depth (Keamanan Berlapis)

| Lapis | Contoh | Status |
|---|---|---|
| Database | `CHECK` constraint (`chk_operator_id_matches_source`, dst.) | Desain, tabel terkait belum live |
| Aplikasi | Validasi bisnis + RBAC enforcement pada endpoint | RBAC belum ditegakkan sama sekali (Story SEC-1) |
| Infrastruktur | Rate limiting lapis kedua di reverse proxy (ADR-009) | Belum ada sama sekali (Story SEC-2) |

**Catatan jujur:** prinsip "berlapis" ini secara desain sudah benar, tapi saat ini secara implementasi lebih tepat disebut "belum berlapis sama sekali" pada 2 dari 3 lapis yang didesain. Jangan mengutip bagian ini sebagai bukti keamanan sudah tegak - lihat Epic E0 (Security & Hardening) untuk status implementasi sesungguhnya.

## 9.3 Delivery > Complexity

- ADR-013 memilih mempertahankan REST Polling yang sudah berfungsi di prototipe, alih-alih memaksakan migrasi ke Firebase RTDB.
- ADR-012 sengaja menangguhkan desain detail jalur remote trigger sirine, alih-alih merancang prematur.
- **Baru:** ADR-027 memilih mempertahankan envelope response `{success, message, data}` yang sudah live, alih-alih memaksa migrasi kode mengikuti dokumen desain awal (`{status, code, message, data}`) yang ternyata menyimpang dari implementasi sejak awal.

## 9.4 Non-Functional Requirements Terkait Arsitektur

| NFR | Sumber | Implikasi Arsitektur | Status |
|---|---|---|---|
| Interval polling IoT 15 detik | Ditetapkan firmware Tim IoT | Batas bawah latensi pembaruan level | **Perlu verifikasi** - endpoint polling level per-device tidak ditemukan di kode nyata saat audit (lihat `05_iot_architecture.md` §5.0), hanya heartbeat + status agregat yang terkonfirmasi live |
| Aksesibilitas (PRD §5.3) | Warga literasi digital terbatas | Pesan error harus dapat diterjemahkan ke bahasa sederhana | Tidak berubah |
| Fallback AI API | PRD §5.1 | `AiSummaryResponse.fallback` (boolean) di kontrak API | Desain final, fitur AI Summary sendiri belum live |