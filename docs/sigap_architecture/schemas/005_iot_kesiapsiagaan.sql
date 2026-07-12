-- =====================================================================
-- 005_iot_kesiapsiagaan.sql
-- SIGAP - Domain: IoT Kesiapsiagaan (Indikator + Sirine)
-- Bergantung pada: 001_core_types.sql, 002_users.sql (FK operator_id)
--
-- STATUS: yellow - dua keputusan governance masih TBD
-- (jalur tombol sirine network vs lokal; protokol komunikasi platform<->device).
-- Skema di bawah didesain "superset-safe": field yang bergantung TBD
-- dibuat NULLABLE, agar tidak perlu ALTER TABLE besar setelah TBD closed.
-- Lihat PRD SIGAP v4.0 §7.1.
-- =====================================================================

CREATE TABLE iot_devices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name    VARCHAR(100) NOT NULL,
  latitude       NUMERIC(9,6),
  longitude      NUMERIC(9,6),
  status         device_connectivity NOT NULL DEFAULT 'offline',
  -- Fail-safe (Final, diputuskan 09/07/2026): saat offline, current_level
  -- TIDAK dianggap valid oleh FE meski kolom ini menyimpan nilai terakhir -
  -- FE wajib merujuk kombinasi (status, last_seen_at), bukan current_level saja.
  current_level  status_level NOT NULL DEFAULT 'hijau',
  last_seen_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE device_status_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id   UUID NOT NULL REFERENCES iot_devices(id),
  level_sent  status_level NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- TBD §7.1: hanya terisi jika jalur platform<->device network-connected.
  -- NULL jika device tidak mengirim acknowledgment (mis. jalur lokal murni).
  ack_status  VARCHAR(20)
);

CREATE TABLE siren_action_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id         UUID NOT NULL REFERENCES iot_devices(id),
  -- TBD §7.1: hanya terisi jika tombol network-connected & operator
  -- teridentifikasi oleh sistem. NULL jika jalur lokal murni (tanpa audit
  -- trail digital untuk siapa yang memicu - lihat catatan PRD §7).
  operator_id       UUID REFERENCES users(id),
  -- Safeguard by design: hanya Oranye & Merah yang boleh trigger sirine.
  -- Hijau dan Kuning murni indikator visual, tidak bisa memicu sirine.
  level_at_trigger  status_level NOT NULL
    CHECK (level_at_trigger IN ('oranye', 'merah')),
  triggered_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_iot_devices_updated_at
  BEFORE UPDATE ON iot_devices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_device_status_log_device_id ON device_status_log (device_id, sent_at DESC);
CREATE INDEX idx_siren_action_log_device_id ON siren_action_log (device_id, triggered_at DESC);
