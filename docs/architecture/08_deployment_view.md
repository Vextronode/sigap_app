# 8. Deployment View

## 8.1 Topologi

Sesuai arah deployment program (Context Program): **Production** di-hosting di server desa, **Staging** di-hosting di kampus.

```mermaid
flowchart TB
    subgraph Prod[Production - Hosting Desa]
        ProdBE[Backend SIGAP]
        ProdDB[(PostgreSQL)]
        ProdBE --> ProdDB
    end

    subgraph Staging[Staging - Hosting Kampus]
        StgBE[Backend SIGAP]
        StgDB[(PostgreSQL)]
        StgBE --> StgDB
    end

    subgraph Lapangan[Lapangan Desa Cibenda]
        Dev1[Perangkat 1
        Indikator + Kontrol]
        Dev2[Perangkat 2
        Sirine Jarak Jauh]
        Dev1 -.ESP-NOW
        Channel 10.-> Dev2
    end

    Browser[Browser Warga/Admin]

    Browser -->|HTTPS| ProdBE
    Dev1 -->|HTTP Polling 15s,
    Heartbeat 60s| ProdBE

    ProdBE -->|HTTPS| ExtAPI[BMKG/USGS/OWM/AI]
    ProdBE -->|HTTPS + X-API-Key| SID[SID]
```

## 8.2 Status Hosting

| Environment | Status | Catatan |
|---|---|---|
| Production | TBD, menunggu konfirmasi Tim DevOps | Arah program: hosting desa (lihat PRD §4) |
| Staging | TBD, menunggu konfirmasi Tim DevOps | Arah program: hosting kampus |

## 8.3 Urutan Migrasi Database

Skema dijalankan sesuai urutan penomoran file di `db/schema/`, mencerminkan dependency foreign key:

```
001_core_types.sql       (extension, ENUM, trigger function)
002_users.sql            (tidak bergantung tabel lain)
003_content_admin.sql    (bergantung: users)
004_environmental.sql    (bergantung: 001 - status_level)
005_iot_kesiapsiagaan.sql (bergantung: 001, 002)
006_rbac.sql             (bergantung: 002 - users)
```

## 8.4 Environment Variables (Kerangka Awal)

> Daftar ini kerangka awal untuk memulai — bukan daftar final, akan bertambah seiring implementasi.

| Variable | Deskripsi |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Kunci penandatanganan token pengguna |
| `DEVICE_API_KEY_*` | Kunci autentikasi per perangkat IoT (skema provisioning belum final) |
| `SID_API_KEY` | Kunci autentikasi ke SID (interim, ADR-024) |
| `BMKG_API_*`, `USGS_API_*`, `OWM_API_KEY` | Kredensial sumber data eksternal |
| `AI_API_KEY` | Kredensial layanan AI Summary |
