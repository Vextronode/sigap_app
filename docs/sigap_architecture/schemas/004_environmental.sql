-- =====================================================================
-- 004_environmental.sql
-- SIGAP - Domain: Data Lingkungan & Alert
-- Bergantung pada: 001_core_types.sql (status_level)
-- =====================================================================

CREATE TABLE environmental_data (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source       VARCHAR(30) NOT NULL
    CHECK (source IN ('BMKG', 'USGS', 'OpenWeatherMap')),
  type         VARCHAR(30) NOT NULL, -- mis. 'curah_hujan', 'seismik'
  value        NUMERIC NOT NULL,
  unit         VARCHAR(20) NOT NULL,
  recorded_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE alert_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type   VARCHAR(30) NOT NULL, -- banjir/kekeringan/cuaca_ekstrem/seismik
  severity     status_level NOT NULL,
  message      TEXT NOT NULL,
  source_rule  VARCHAR(100) NOT NULL, -- traceability ke rule pemicu
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index untuk query dashboard (data terbaru per sumber/tipe)
CREATE INDEX idx_environmental_data_recorded_at ON environmental_data (recorded_at DESC);
CREATE INDEX idx_alert_log_triggered_at ON alert_log (triggered_at DESC);
