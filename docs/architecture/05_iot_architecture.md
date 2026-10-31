# 5. IoT Architecture

## 5.0 Catatan Status & Terminologi (baru)

Terminologi direvisi mengikuti kesepakatan protokol keamanan sirine: **Unit Utama** (menggantikan sebutan "Perangkat 1" - indikator + tombol pemicu, satu unit tunggal) dan **Sirine/Toa** (menggantikan "Perangkat 2" - saat ini satu unit, arsitektur mendukung penambahan lebih banyak ke depan).

**Gap terbuka yang perlu keputusan eksplisit:** dokumen versi sebelumnya menggambarkan Unit Utama melakukan *polling level per-device* (`GET /device/{id}/level`, tiap 15 detik) sebagai endpoint tersendiri. Audit kode tidak menemukan endpoint ini sama sekali - yang ada adalah `GET /public/device/status` (mengembalikan status **agregat** sistem: level + ringkasan jumlah perangkat, bukan level satu device spesifik) dan `POST /public/device/heartbeat` (body `deviceCode`, tanpa mengembalikan level). Perlu diputuskan: (a) polling level per-device tetap direncanakan sebagai endpoint baru yang belum dibangun, atau (b) Unit Utama cukup baca level dari endpoint agregat yang sudah ada, dan diagram di bawah perlu disederhanakan mengikuti itu. Diagram S5.2 di bawah saya pertahankan sebagai **desain target** dengan asumsi (a), sambil menandai ketidakpastian ini eksplisit - jangan dianggap terverifikasi terhadap kode.

## 5.1 Ringkasan

Perangkat IoT SIGAP berfungsi sebagai **penerima/aktuator** (indikator level + sirine), bukan sebagai sumber data sensor - integrasi sensor lapangan tetap Out of Scope (lihat PRD S3.2). Arsitektur aktuasi sirine bersifat hybrid: jalur lokal fisik (selalu tersedia, dieksekusi langsung di Unit Utama tanpa melalui backend) dan jalur remote aplikasi (protokol keamanan sudah final - cooldown, eskalasi, konfirmasi RED - implementasi dijadwalkan Sprint 3 Tahap 2, Story FS-09).

## 5.2 Sequence Diagram - Jalur Lokal Fisik (Desain Target, Sebagian Belum Terverifikasi)

```mermaid
sequenceDiagram
    participant BE as Backend SIGAP
    participant UU as Unit Utama
    participant Op as Operator

    loop Setiap 15 detik (status: perlu verifikasi - lihat 5.0)
        UU->>BE: Polling level kesiapsiagaan
        BE-->>UU: level terkini
    end
    loop Setiap 60 detik
        UU->>BE: POST /public/device/heartbeat (body: deviceCode)
        BE-->>UU: 200 OK
    end
    UU->>UU: Tampilkan LED sesuai level
    Note over UU: Level Kuning & Hijau -
    LED sama, tombol nonaktif
    Op->>UU: Tekan tombol fisik
    Note over UU: Hanya aktif jika
    level = ORANGE/RED
    UU->>UU: Bunyikan Sirine
    (via ESP-NOW)
    UU->>BE: Laporkan kejadian (siklus poll/heartbeat berikutnya)
    Note over BE: trigger_source = fisik
    triggeredBy = NULL
```

**Koreksi dari versi sebelumnya:** langkah pelaporan kejadian sirine ke backend **bukan** lewat Firebase Realtime Database (arsitektur itu sudah ditiadakan) - pelaporan terjadi asinkron lewat siklus heartbeat/poll REST yang sama, bukan channel real-time terpisah.

## 5.3 Sequence Diagram - Jalur Remote Aplikasi

```mermaid
sequenceDiagram
    participant Op as Operator (Admin Panel)
    participant BE as Backend SIGAP
    participant UU as Unit Utama
    participant Si as Sirine

    Note over Op,Si: Protokol keamanan FINAL (FS-09) -
    implementasi dijadwalkan Sprint 3 Tahap 2
    Op->>BE: POST /protected/devices/trigger-siren
    Note over BE: body: { confirmed: boolean }
    tanpa {id} - broadcast ke semua Sirine
    BE->>BE: Validasi level = ORANGE/RED
    BE->>BE: Validasi cooldown (60 detik,
    kecuali eskalasi RED)
    BE->>BE: Validasi confirmed=true jika RED
    BE-->>Op: 202 Accepted (command diterima,
    belum tentu tereksekusi)
    Note over BE,UU: Command dititip ke siklus
    poll berikutnya (<=15 detik, ADR-013)
    UU->>BE: Poll berikutnya - ambil command
    UU->>UU: Re-validasi level saat ini
    UU->>Si: Broadcast trigger (ESP-NOW)
    Si-->>UU: Ack (jika feasible - lihat FS-08 S8)
    UU->>BE: Laporkan hasil eksekusi
    Note over BE: siren_action_log:
    trigger_source = digital
    triggeredBy = dari token asal
    ackStatus = hasil laporan
```

**Koreksi dari versi sebelumnya:** endpoint tidak lagi menerima `{id}` (broadcast, bukan per-perangkat); response `202` bukan `201` (async, bukan langsung tereksekusi); ditambahkan langkah cooldown, eskalasi RED, dan konfirmasi 2-langkah yang sebelumnya tidak ada di diagram ini sama sekali.

## 5.4 Protokol Komunikasi

REST Polling langsung ke backend (ADR-013) - bukan Firebase RTDB. Interval polling (15 detik, **status perlu verifikasi**, lihat 5.0) dan heartbeat (60 detik, **terverifikasi ada di kode**) ditetapkan firmware Tim IoT, menjadi batas bawah latensi sistem yang harus diperhitungkan di NFR terkait.

**Autentikasi jalur ini** *(baru)*: saat ini **tidak ada** - endpoint device (`register`/`heartbeat`/`status`) dapat dipanggil siapa pun tanpa kredensial. Target: `X-Device-Secret` per `deviceCode`, Story SEC-7.

## 5.5 Fail-Safe

Saat perangkat kehilangan koneksi (`status != ONLINE` - nilai enum nyata: `ONLINE`/`OFFLINE`, dua nilai saja, bukan tiga seperti mungkin tersirat di dokumen lama), `current_level` tidak dianggap valid oleh konsumen data manapun (ADR-004) - mencegah kesan keliru bahwa kondisi aman padahal data sudah usang.

## 5.6 Safeguard Aktivasi Sirine

Hanya level ORANGE dan RED (enum `AlertLevel` nyata: `GREEN/YELLOW/ORANGE/RED` - **koreksi** dari `oranye`/`merah` versi dokumen sebelumnya) yang membuka opsi aktivasi sirine, ditegakkan berlapis: validasi endpoint aplikasi (terverifikasi jadi bagian desain FS-09), dan `CHECK` constraint database (**belum saya verifikasi ada di schema Prisma nyata** - audit sebelumnya tidak menunjukkan constraint level ini di `Alert`/`Device` model, cuma enum tipe datanya. Perlu dicek terpisah apakah CHECK constraint level ini benar ada, atau cuma direncanakan).

## 5.7 Cooldown & Eskalasi *(baru - tidak ada di versi sebelumnya)*

- Cooldown 60 detik pasca-trigger apa pun (fisik atau digital), berlaku global terhadap kedua jalur.
- Eskalasi ke RED selama cooldown sebelumnya masih berjalan memotong cooldown, membuka kembali opsi trigger segera - mencegah spam sirine di level yang sama/menurun tanpa menghalangi respons terhadap bahaya yang benar-benar meningkat.
- Detail lengkap: FS-09, Story `SIGAP-T2-E2-S9`.