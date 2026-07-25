-- =====================================================================
-- 005_iot_kesiapsiagaan.sql
-- SIGAP — Domain: IoT Kesiapsiagaan (Indikator + Sirine)
-- Bergantung pada: 001_core_types.sql, 002_users.sql (FK operator_id)
--
-- Arsitektur aktuasi sirine: HYBRID.
--   1. Lokal fisik  — tombol terhubung langsung ke rangkaian sirine di
--      device, selalu berfungsi tanpa bergantung pada jaringan.
--   2. Remote aplikasi — operator dapat memicu sirine dari luar lokasi
--      (mis. saat dinas luar) melalui aplikasi, diteruskan platform ke
--      device. Menyusul setelah jalur komunikasi platform<->device siap.
-- =====================================================================

CREATE TYPE siren_trigger_source AS ENUM ('lokal_fisik', 'remote_aplikasi');

CREATE TABLE iot_devices (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name        VARCHAR(100) NOT NULL,
  latitude           NUMERIC(9,6),
  longitude          NUMERIC(9,6),
  status             device_connectivity NOT NULL DEFAULT 'offline',
  current_level      status_level NOT NULL DEFAULT 'hijau',
  last_seen_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN iot_devices.current_level IS
  'Fail-safe: saat status = offline, nilai ini tidak dianggap valid oleh FE. FE wajib merujuk kombinasi (status, last_seen_at), bukan current_level saja.';

CREATE TABLE device_status_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id    UUID NOT NULL REFERENCES iot_devices(id),
  level_sent   status_level NOT NULL,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- terakhir tersinkron ke device (bukan acknowledgment manual).
  sync_status  VARCHAR(20)
);

CREATE TABLE siren_action_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id         UUID NOT NULL REFERENCES iot_devices(id),
  trigger_source    siren_trigger_source NOT NULL,
  -- Terisi hanya jika trigger_source = 'remote_aplikasi' (operator
  -- teridentifikasi lewat token aplikasi). NULL jika 'lokal_fisik'.
  operator_id       UUID REFERENCES users(id),
  -- Safeguard by design: hanya Oranye & Merah yang boleh trigger sirine.
  level_at_trigger  status_level NOT NULL
    CHECK (level_at_trigger IN ('oranye', 'merah')),
  triggered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_operator_id_matches_source CHECK (
    (trigger_source = 'remote_aplikasi' AND operator_id IS NOT NULL) OR
    (trigger_source = 'lokal_fisik')
  )
);

CREATE TRIGGER trg_iot_devices_updated_at
  BEFORE UPDATE ON iot_devices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_device_status_log_device_id ON device_status_log (device_id, sent_at DESC);
CREATE INDEX idx_siren_action_log_device_id ON siren_action_log (device_id, triggered_at DESC);
