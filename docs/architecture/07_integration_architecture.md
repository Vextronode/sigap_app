# 7. Integration Architecture

> Status: bagian ini menggambarkan desain yang **diusulkan dari sisi SIGAP** — belum final lintas program. Lihat `integration/SID_INTEGRATION_PROPOSAL.md` dan ADR-022 s.d. ADR-025.

## 7.1 Ringkasan

SIGAP berintegrasi dengan SID untuk satu tujuan spesifik: memanfaatkan infrastruktur push notification PWA milik SID sebagai kanal pengiriman notifikasi operator, tanpa membangun sistem notifikasi sendiri.

## 7.2 Diagram Integrasi

```mermaid
sequenceDiagram
    participant RE as Rule Engine (SIGAP)
    participant SIGAP as Backend SIGAP
    participant SID as SID (PWA Push Service)
    participant Op as Operator

    RE->>SIGAP: level_change / alert_validated
    SIGAP->>SIGAP: Catat ke alert_log
    (independen dari status SID)
    SIGAP->>SID: POST /integrations/sigap/notifications
    (X-API-Key)
    SID-->>SIGAP: 202 Accepted (usulan)
    SID->>Op: Push notification
    Op->>SID: Tap notifikasi
    SID->>Op: Buka deep_link
    (Dashboard SIGAP, bukan SID)
```

## 7.3 Prinsip Integrasi

- **Independent domain tetap terjaga** — SID tidak memiliki akses ke database SIGAP; integrasi terbatas pada payload event dan target URL (ADR-022).
- **SIGAP tetap single source of truth** — deep-link selalu mengarah balik ke SIGAP, SID tidak menampilkan/menyimpan konten SIGAP (ADR-023).
- **Tidak ada single point of failure** — kegagalan pengiriman ke SID tidak memengaruhi pencatatan inti SIGAP; dashboard dan indikator fisik tetap berfungsi independen dari ketersediaan SID (ADR-025).

## 7.4 Isu Terbuka

Lihat Bagian 10 (Risks and Open Issues) — autentikasi API Key masih interim (ADR-024), dan struktur routing frontend SIGAP untuk membangun `deep_link` belum terdokumentasi resmi.
