# 3. Data Architecture

> Rincian tipe data, constraint, dan contoh nilai per field ada di `db/data-dictionary/`. Bagian ini menyajikan ringkasan relasi antar-entity — bukan pengganti Data Dictionary.

## 3.1 Entity Relationship Diagram (Ringkas)

```mermaid
erDiagram
    users ||--o{ user_roles : memiliki
    roles ||--o{ user_roles : diberikan_ke
    roles ||--o{ role_permissions : memiliki
    permissions ||--o{ role_permissions : diberikan_ke
    users ||--o{ announcements : membuat
    users ||--o{ siren_action_log : memicu_remote

    iot_devices ||--o{ device_status_log : menerima
    iot_devices ||--o{ siren_action_log : mencatat

    alert_log }o--|| users : divalidasi_oleh

    users {
        uuid id PK
        string email
        string password_hash
    }
    roles {
        uuid id PK
        string name
    }
    iot_devices {
        uuid id PK
        string device_name
        enum status
        enum current_level
    }
    siren_action_log {
        uuid id PK
        enum trigger_source
        uuid operator_id FK
        enum level_at_trigger
    }
    alert_log {
        uuid id PK
        enum severity
        uuid validated_by FK
    }
```

## 3.2 Ringkasan Domain Entity

| Domain | Entity | File Skema |
|---|---|---|
| Users & Auth | `users` | `002_users.sql` |
| RBAC | `roles`, `permissions`, `role_permissions`, `user_roles` | `006_rbac.sql` |
| Konten Admin | `announcements`, `evacuation_points`, `evacuation_routes`, `emergency_contacts` | `003_content_admin.sql` |
| Lingkungan & Alert | `environmental_data`, `alert_log` | `004_environmental.sql` |
| IoT Kesiapsiagaan | `iot_devices`, `device_status_log`, `siren_action_log` | `005_iot_kesiapsiagaan.sql` |

## 3.3 Prinsip Arsitektur Data

- **Identifier**: UUID di seluruh tabel tanpa kecuali (ADR-001).
- **Status kesiapsiagaan**: satu ENUM (`status_level`) dipakai lintas domain — tidak ada definisi ulang per tabel (ADR-003).
- **Integrity ditegakkan di database**, bukan hanya di aplikasi — contoh: `chk_operator_id_matches_source` pada `siren_action_log` (ADR-014).
- **Audit standar**: `created_at`/`updated_at` pada tabel yang datanya dapat berubah; kolom waktu spesifik kejadian (`triggered_at`, `recorded_at`) terpisah dari audit timestamp.
