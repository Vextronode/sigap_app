# 10. Risks and Open Issues

Konsolidasi seluruh isu terbuka lintas dokumen — supaya tidak tersebar dan mudah terlewat.

| Isu | Domain | Dampak Jika Tidak Diselesaikan | Pemilik |
|---|---|---|---|
| Jalur remote aplikasi untuk trigger sirine belum diimplementasikan (sengaja ditangguhkan) | IoT | Operator tidak dapat memicu sirine saat berada di luar lokasi | Tech Lead + Tim IoT |
| Skema provisioning Device API Key belum final | Security / Device Gateway | Perangkat tidak dapat diautentikasi dengan aman ke Device Gateway | Tech Lead |
| Hosting production & staging masih TBD | Deployment | Tidak ada lingkungan nyata untuk deployment | Tim DevOps |
| Autentikasi lintas sistem SIGAP↔SID masih interim (API Key statis) | Integrasi | Skema autentikasi mungkin perlu diganti begitu standar program resmi ditetapkan | Tech Lead + Architecture Working Group |
| Struktur routing frontend SIGAP belum terdokumentasi resmi | API / Integrasi | `deep_link` pada integrasi SID tidak dapat dibangun dengan benar | Tech Lead + Tim Frontend |
| Retry policy pengiriman notifikasi ke SID belum ditentukan | Integrasi | Notifikasi dapat hilang tanpa percobaan ulang saat SID mengalami gangguan sementara | Tech Lead + Tim SID |
| Baseline angka rate limiting belum divalidasi dengan data trafik nyata | Security | Limit mungkin terlalu ketat/longgar dibanding kebutuhan aktual | Tech Lead |
| Kontrak API SID (endpoint, response schema) belum disetujui Tim SID | Integrasi | Seluruh Bagian 7 (Integration Architecture) berpotensi berubah | Tech Lead SIGAP + Tech Lead SID |

## Prioritas Penyelesaian yang Disarankan

1. **Kontrak API SID** dan **skema Device API Key** — keduanya blocking untuk implementasi (tanpa ini, dua building block tidak dapat berfungsi sama sekali).
2. **Hosting production/staging** — blocking untuk Deployment Guide (dokumen berikutnya).
3. Sisanya bersifat penyempurnaan (dapat berjalan paralel dengan development, tidak menghambat MVP).
