# 10. Risks and Open Issues

Konsolidasi seluruh isu terbuka lintas dokumen — supaya tidak tersebar dan mudah terlewat.

| Isu | Domain | Dampak Jika Tidak Diselesaikan | Pemilik |
|---|---|---|---|
| Penamaan enum `trigger_source` - ADR-014 (`lokal_fisik`/`remote_aplikasi`) vs desain protokol sirine Tahap 2 (`fisik`/`digital`/`dibatalkan_otomatis`) | IoT | Migrasi schema tertunda, developer bingung istilah mana yang dipakai | Tech Lead |
| Autentikasi Device Gateway (`X-Device-Secret`, sebelumnya disebut "Device API Key") belum diimplementasikan | Security / Device Gateway | Endpoint device (`register`/`heartbeat`/`status`) saat ini **tanpa autentikasi sama sekali** - dikonfirmasi audit kode, bukan lagi sekadar risiko teoretis | Tech Lead (Story SEC-7) |
| RBAC enforcement (middleware permission) belum diimplementasikan meski skema & seed sudah lengkap | Security | Nol `403` ditemukan di seluruh backend - siapa pun dengan token valid bisa akses endpoint Protected apa pun | Tech Lead (Story SEC-1) |
| Rate limiting belum diimplementasikan sama sekali (bukan sekadar baseline belum divalidasi) | Security | Endpoint publik (termasuk login) rentan brute-force/scraping tanpa proteksi apa pun saat ini | Tech Lead (Story SEC-2) |
| Kanal notifikasi ke operator: kode nyata memakai Web Push langsung (tanpa SID), berbeda dari rencana dual-channel Roadmap Tahap 2 §2.1 #5 | Integrasi | Perlu keputusan eksplisit: tetap dual-channel (bangun integrasi SID di atas Web Push yang sudah ada), atau Web Push-only jadi solusi final (Roadmap perlu direvisi) | Tech Lead SIGAP + PM |
| Retry policy pengiriman notifikasi ke SID belum ditentukan | Integrasi | **Berubah relevansi** - saat ini SID belum terintegrasi sama sekali untuk notifikasi (lihat baris di atas), jadi retry policy baru relevan setelah keputusan dual-channel diambil | Tech Lead + Tim SID |
| Jalur remote aplikasi untuk trigger sirine | IoT | **Status berubah dari "ditangguhkan" menjadi "protokol final, implementasi dijadwalkan"** - cooldown, eskalasi RED, konfirmasi 2-langkah sudah didesain lengkap (FS-09), dikerjakan Sprint 3 Tahap 2 | IoT (Story `SIGAP-T2-E2-S9`) |
| Hosting production & staging masih TBD | Deployment | Tidak ada lingkungan nyata untuk deployment permanen (preview Vercel dipakai sementara untuk dev) | Tim DevOps |
| Autentikasi lintas sistem SIGAP↔SID masih interim (API Key statis) | Integrasi | Skema autentikasi mungkin perlu diganti begitu standar program resmi ditetapkan | Tech Lead + Architecture Working Group |
| Struktur routing frontend SIGAP belum terdokumentasi resmi | API / Integrasi | `deep_link` pada integrasi SID tidak dapat dibangun dengan benar | Tech Lead + Tim Frontend |
| Kontrak API SID (endpoint, response schema) belum disetujui Tim SID | Integrasi | Seluruh Bagian 7 (Integration Architecture) berpotensi berubah | Tech Lead SIGAP + Tech Lead SID |
| Envelope error tidak konsisten (`errors` campur array/object/kosong) di kode nyata | Cross-cutting | Konsumen API (frontend) harus menangani banyak bentuk error berbeda - sudah dikonfirmasi audit, bukan risiko teoretis | Tech Lead (Story SEC-9) |
| Konsistensi penamaan kolom junction table RBAC (dokumen SQL vs Prisma) | Data | **Terselesaikan** - dikonfirmasi via query langsung: DB pakai camelCase (`roleId`, dst.), `006_rbac.sql` sudah diperbaiki mengikuti ini | ~~Tech Lead~~ Closed |

## Prioritas Penyelesaian yang Disarankan

1. **RBAC enforcement (SEC-1)** dan **Rate limiting (SEC-2)** — keduanya gap keamanan aktif yang terkonfirmasi kode, bukan lagi risiko teoretis; naik prioritas di atas item lama manapun.
2. **Autentikasi Device Gateway (SEC-7)** dan **reconciliation `device_id`/`trigger_source`** — blocking untuk memulai migrasi schema IoT ke Prisma.
3. **Kontrak API SID** dan keputusan kanal notifikasi (dual-channel vs Web Push-only) — blocking untuk Bagian 7 (Integration Architecture) dan untuk menutup ambiguitas Roadmap Tahap 2.
4. **Hosting production/staging** — blocking untuk Deployment Guide.
5. Sisanya bersifat penyempurnaan, dapat berjalan paralel dengan development.