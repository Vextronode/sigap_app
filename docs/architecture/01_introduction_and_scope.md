# 1. Introduction and Scope

## 1.1 Tujuan Sistem

SIGAP adalah platform monitoring lingkungan dan kesiapsiagaan bencana untuk Desa Cibenda, Kabupaten Pangandaran - mengolah data resmi (BMKG, USGS, OpenWeatherMap) menjadi informasi actionable, dilengkapi lapisan kesiapsiagaan fisik (indikator level dan sirine di titik strategis desa). Detail lengkap tujuan produk dan metrik keberhasilan ada di `PRD_SIGAP_v4.md`; dokumen ini fokus pada bentuk arsitekturnya.

## 1.2 Stakeholder

| Stakeholder | Kepentingan Terhadap Arsitektur |
|---|---|
| Warga Desa | Konsumen data publik (cuaca, alert, evakuasi) - tidak berinteraksi dengan kompleksitas arsitektur secara langsung |
| Admin/Operator | Pengguna Protected API - kelola konten, validasi alert, verifikasi/trigger sirine |
| Tech Lead SIGAP | Pemilik keputusan arsitektur, penulis ADR |
| Tim IoT | Implementasi firmware perangkat, pihak yang menentukan kelayakan teknis keputusan hardware |
| Tech Lead SID | Pihak eksternal pada integrasi lintas sistem (Bagian 7) |
| QA/DevOps Coordinator | Konsumen dokumen ini untuk validasi dan deployment |

## 1.3 System Context Diagram

```mermaid
flowchart TB
    Warga([Warga Desa])
    Admin([Admin / Operator])
    IoT[Perangkat IoT
    Indikator + Sirine]

    subgraph SIGAP[Sistem SIGAP]
        direction TB
        Core((Platform SIGAP))
    end

    BMKG[(BMKG)]
    USGS[(USGS)]
    OWM[(OpenWeatherMap)]
    AI[(AI API)]
    SID[(SID - PWA
    Notification Channel)]

    Warga -- browse dashboard --> Core
    Admin -- login, kelola konten,
    validasi, trigger sirine --> Core
    Core -- tarik data --> BMKG
    Core -- tarik data --> USGS
    Core -- tarik data --> OWM
    Core -- request ringkasan --> AI
    Core -- kirim level --> IoT
    IoT -- polling & lapor event --> Core
    Core -- kirim event notifikasi --> SID
    SID -- push notification,
    deep-link balik --> Admin
```

## 1.4 Batasan Arsitektur (Constraints)

Diwarisi dari governance program (Konteks Umum Program - Tech Lead), berlaku mengikat untuk SIGAP:

- **Independent domain** - SIGAP tidak berbagi database dengan SID maupun sistem lain dalam program (lihat ADR-022, Bagian 7).
- **Tidak boleh deep microservices/tight coupling** - integrasi lintas sistem (SID) dibatasi pada API-based communication, bukan akses langsung ke internal masing-masing sistem.
- **Standardisasi lintas sistem** - identifier convention (UUID, ADR-001), auth pattern, dan naming convention mengikuti kesepakatan program, bukan preferensi SIGAP sendiri semata.
- **Delivery > Complexity** - tercermin di beberapa ADR (mis. ADR-013, memilih mempertahankan implementasi yang sudah berjalan alih-alih migrasi ke solusi yang "lebih elegan" di atas kertas).
