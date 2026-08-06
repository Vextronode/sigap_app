# 5. IoT Architecture

## 5.1 Ringkasan

Perangkat IoT SIGAP berfungsi sebagai **penerima/aktuator** (indikator level + sirine), bukan sebagai sumber data sensor — integrasi sensor lapangan tetap Out of Scope (lihat PRD §3.2). Arsitektur aktuasi sirine bersifat hybrid: jalur lokal fisik (selalu tersedia) dan jalur remote aplikasi (ditangguhkan implementasinya, lihat ADR-012).

## 5.2 Sequence Diagram — Jalur Lokal Fisik (Aktif)

```mermaid
sequenceDiagram
    participant BE as Backend SIGAP
    participant Dev as Perangkat IoT
    participant Op as Operator

    loop Setiap 15 detik
        Dev->>BE: GET /device/{id}/level
        BE-->>Dev: level terkini
    end
    loop Setiap 60 detik
        Dev->>BE: POST /device/{id}/heartbeat
        BE-->>Dev: 204 No Content
    end
    Dev->>Dev: Tampilkan LED sesuai level
    Note over Dev: Level Kuning & Hijau -
    LED sama (ADR-015),
    tombol nonaktif (ADR-011)
    Op->>Dev: Tekan tombol fisik
    Note over Dev: Hanya aktif jika
    level = Oranye/Merah
    Dev->>Dev: Bunyikan sirine
    (via ESP-NOW ke Perangkat 2)
    Dev->>BE: POST /device/{id}/siren-events
    Note over BE: trigger_source = lokal_fisik
    operator_id = NULL
```

## 5.3 Sequence Diagram — Jalur Remote Aplikasi (Ditangguhkan)

```mermaid
sequenceDiagram
    participant Op as Operator (App)
    participant BE as Backend SIGAP
    participant Dev as Perangkat IoT

    Note over Op,Dev: Belum diimplementasikan -
    ditangguhkan sesuai ADR-012
    Op->>BE: POST /protected/devices/{id}/trigger-siren
    BE->>BE: Validasi level = Oranye/Merah
    BE->>Dev: (mekanisme pengiriman - TBD)
    BE->>BE: Catat siren_action_log
    trigger_source = remote_aplikasi
    operator_id = dari token
```

## 5.4 Protokol Komunikasi

REST Polling langsung ke backend (ADR-013) — bukan Firebase RTDB seperti keputusan awal. Interval polling (15 detik) dan heartbeat (60 detik) ditetapkan oleh firmware Tim IoT, bukan oleh backend — parameter ini menjadi batas bawah latensi sistem yang perlu diperhitungkan pada Non-Functional Requirement terkait (Bagian 9).

## 5.5 Fail-Safe

Saat perangkat kehilangan koneksi (`status != online`), `current_level` tidak dianggap valid oleh konsumen data manapun (ADR-004) — mencegah kesan keliru bahwa kondisi aman padahal data sudah usang.

## 5.6 Safeguard Aktivasi Sirine

Hanya level Oranye dan Merah yang membuka opsi aktivasi sirine (ADR-011), ditegakkan di dua lapis: `CHECK` constraint database dan validasi endpoint aplikasi.
