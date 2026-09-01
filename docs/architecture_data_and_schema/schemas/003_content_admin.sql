-- =====================================================================
-- 003_content_admin.sql
-- SIGAP - Domain: Konten Admin (Pengumuman, Evakuasi, Kontak Darurat)
-- Bergantung pada: 001_core_types.sql, 002_users.sql (FK created_by)
-- =====================================================================

CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evacuation_points (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  latitude    NUMERIC(9,6) NOT NULL,
  longitude   NUMERIC(9,6) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evacuation_routes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name  VARCHAR(255) NOT NULL,
  -- Disimpan sebagai JSONB (array koordinat), bukan tipe spasial PostGIS -
  -- tech stack belum menyebut PostGIS, dan Leaflet cukup dengan array biasa.
  -- Asumsi, tandai jika perlu diubah.
  geometry    JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE emergency_contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution  VARCHAR(255) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_evacuation_points_updated_at
  BEFORE UPDATE ON evacuation_points
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_evacuation_routes_updated_at
  BEFORE UPDATE ON evacuation_routes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
