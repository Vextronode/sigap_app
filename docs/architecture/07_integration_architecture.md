# 7. Integration Architecture

> **Status: BELUM LIVE.** Bagian ini menggambarkan desain yang **diusulkan dari sisi SIGAP** — belum diimplementasikan sama sekali di kode, dan belum final lintas program (menunggu sign-off Tim SID). Lihat `integration/SID_INTEGRATION_PROPOSAL.md` dan ADR-022 s.d. ADR-025.
>
> **Yang benar-benar live saat ini:** SIGAP mengirim Web Push **langsung** ke warga (VAPID, tanpa SID sama sekali) - keputusan sadar tim backend untuk tidak bergantung pada timeline tim lain yang belum pasti, ditemukan lewat audit kode. Integrasi SID di bawah ini, bila terealisasi, akan menjadi **kanal tambahan** di samping Web Push yang sudah ada (dual-channel, Roadmap Tahap 2 §2.1 #5) - bukan pengganti maupun kanal pertama.

## 7.1 Ringkasan

SIGAP berencana berintegrasi dengan SID untuk satu tujuan spesifik: memanfaatkan infrastruktur push notification PWA milik SID sebagai kanal pengiriman notifikasi **tambahan**, di samping Web Push milik SIGAP sendiri yang sudah berjalan.

## 7.2 Diagram Integrasi (Rencana, Belum Live)

```mermaid
sequenceDiagram
    participant RE as Rule Engine (SIGAP)
    participant SIGAP as Backend SIGAP
    participant WP as Web Push SIGAP
    participant SID as SID (rencana)
    participant Op as Operator/Warga

    RE->>SIGAP: level_change / alert baru
    SIGAP->>SIGAP: Catat ke alerts
    (independen dari kanal notifikasi manapun)
    SIGAP->>WP: Kirim Web Push
    (SUDAH LIVE)
    WP->>Op: Push notification
    SIGAP-->>SID: POST event (RENCANA, belum live)
    Note over SID: Menunggu kontrak API,
    konfirmasi Tim SID
    SID-->>Op: Push notification (rencana)
    Op->>SID: Tap notifikasi (rencana)
    SID->>Op: Buka deep_link
    (Dashboard SIGAP, rencana)
```

## 7.3 Prinsip Integrasi

- **Independent domain tetap terjaga** — SID tidak memiliki akses ke database SIGAP; integrasi terbatas pada payload event dan target URL (ADR-022).
- **SIGAP tetap single source of truth** — deep-link selalu mengarah balik ke SIGAP, SID tidak menampilkan/menyimpan konten SIGAP (ADR-023).
- **Tidak ada single point of failure** — kegagalan pengiriman ke SID (bila terealisasi) tidak memengaruhi pencatatan inti SIGAP maupun Web Push yang sudah berjalan independen (ADR-025).

## 7.4 Pertanyaan Terbuka untuk Tim SID

Lihat pembahasan detail sebelumnya (rekonsiliasi ADR SID) - ringkasnya: kontrak API, konfirmasi posisi SID sebagai kanal tambahan (bukan utama), kebutuhan login/akun untuk terima notifikasi, kemampuan deep-link ke URL eksternal, dan angka retry/timeout. Tidak satu pun dari ini dapat dijawab dari sisi SIGAP sendiri.

## 7.5 Isu Terbuka Lain

Lihat Bagian 10 (Risks and Open Issues) — autentikasi API Key masih interim (ADR-024), struktur routing frontend SIGAP untuk `deep_link` belum terdokumentasi resmi.