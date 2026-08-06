# 9. Cross-Cutting Concerns

Bagian ini merangkum prinsip yang berulang di lebih dari satu domain — bukan keputusan baru, melainkan pola yang perlu dikenali sebagai satu kesatuan filosofi desain.

## 9.1 Fail-Safe by Design

Muncul konsisten di beberapa domain berbeda, dengan prinsip yang sama: **kegagalan/ketidaktahuan tidak boleh disalahartikan sebagai kondisi aman**.

| Domain | Penerapan | ADR |
|---|---|---|
| IoT | Device offline tidak dianggap level "Hijau" | ADR-004 |
| Integrasi SID | Kegagalan kirim notifikasi tidak menghentikan pencatatan inti SIGAP | ADR-025 |
| Aktivasi Sirine | Hanya level Oranye/Merah yang membuka opsi aktivasi — bukan default aktif | ADR-011 |

## 9.2 Defense in Depth (Keamanan Berlapis)

| Lapis | Contoh |
|---|---|
| Database | `CHECK` constraint (`chk_operator_id_matches_source`, level_at_trigger) |
| Aplikasi | Validasi bisnis pada endpoint sebelum menyentuh database |
| Infrastruktur | Rate limiting lapis kedua di reverse proxy (ADR-009) |

## 9.3 Delivery > Complexity

Prinsip program yang tercermin langsung dalam keputusan teknis, bukan sekadar slogan:

- ADR-013 memilih mempertahankan REST Polling yang sudah berfungsi di prototipe, alih-alih memaksakan migrasi ke Firebase RTDB yang sempat dianggap "lebih elegan" di atas kertas.
- ADR-012 sengaja menangguhkan desain detail jalur remote trigger sirine, alih-alih merancang prematur sebelum kondisi operasional nyata diketahui.

## 9.4 Non-Functional Requirements Terkait Arsitektur

| NFR | Sumber | Implikasi Arsitektur |
|---|---|---|
| Interval polling IoT 15 detik | Ditetapkan firmware Tim IoT | Batas bawah latensi pembaruan level ke perangkat — bukan parameter yang bisa diubah backend |
| Aksesibilitas (PRD §5.3) | Warga literasi digital terbatas | Tidak memengaruhi arsitektur backend, tapi membatasi asumsi desain API (mis. pesan error harus dapat diterjemahkan ke bahasa sederhana oleh frontend) |
| Fallback AI API | PRD §5.1 | `AiSummaryResponse.fallback` (boolean) di kontrak API mencerminkan requirement ini secara eksplisit |
