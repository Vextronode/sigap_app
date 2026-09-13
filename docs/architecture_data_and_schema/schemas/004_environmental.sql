-- =====================================================================
-- 004_environmental.sql
-- SIGAP - Domain: Data Lingkungan & Alert
-- Bergantung pada: 001_core_types.sql
--
-- CATATAN REVISI BESAR: tabel `alert_log` diganti nama & struktur
-- mengikuti model `alerts` yang SUDAH LIVE di Prisma - bukan sekadar
-- rename kolom, field alert_type/source_rule/triggered_at/validated_at
-- DIHAPUS, digantikan level/reviewStatus/reviewedBy/reviewedAt sesuai
-- desain FS-02 (klasifikasi 4-status, bukan validasi biner).
-- environmental_data TETAP murni desain, belum ada di database nyata.
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

-- alert_review_status: 4 nilai, PERSIS sesuai FS-02 - sudah live.
CREATE TYPE alert_review_status AS ENUM (
  'Belum Ditinjau', 'Dikonfirmasi', 'Ditolak', 'Ditindaklanjuti'
);

CREATE TABLE alerts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level          alert_level NOT NULL, -- GREEN/YELLOW/ORANGE/RED, lihat 001_core_types.sql
  source         VARCHAR(100) NOT NULL, -- mis. "BMKG", "BMKG (estimasi dari data gempa)"
  description    TEXT,
  review_status  alert_review_status NOT NULL DEFAULT 'Belum Ditinjau',
  reviewed_by    UUID REFERENCES users(id),
  reviewed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_environmental_data_recorded_at ON environmental_data (recorded_at DESC);
CREATE INDEX idx_alerts_created_at ON alerts (created_at DESC);
CREATE INDEX idx_alerts_review_status ON alerts (review_status);