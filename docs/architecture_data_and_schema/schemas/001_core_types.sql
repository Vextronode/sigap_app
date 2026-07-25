-- =====================================================================
-- 001_core_types.sql
-- SIGAP - Draft Schema SQL (INTERIM, 7 Hari - bukan G3 final)
-- Berisi: extension, shared ENUM types, trigger function updated_at.
-- Dijalankan PALING AWAL karena file lain bergantung pada isi file ini.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- untuk gen_random_uuid()

-- Status kesiapsiagaan, 4 level, dipakai lintas domain
-- (alert_log, iot_devices, device_status_log, siren_action_log)
-- agar penamaan konsisten di seluruh sistem (bukan VARCHAR bebas per tabel).
--   hijau  = Aman
--   kuning = Waspada
--   oranye = Siaga
--   merah  = Awas
CREATE TYPE status_level AS ENUM ('hijau', 'kuning', 'oranye', 'merah');

-- Status konektivitas perangkat IoT
CREATE TYPE device_connectivity AS ENUM ('online', 'offline', 'degraded');

-- Trigger function generik untuk auto-update kolom updated_at.
-- Dipakai oleh tabel-tabel yang punya kolom updated_at (lihat file domain).
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
