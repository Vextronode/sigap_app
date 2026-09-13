-- =====================================================================
-- 003_content_admin.sql
-- SIGAP - Domain: Konten Admin (Evakuasi, Kontak Darurat, Panduan)
-- Bergantung pada: 001_core_types.sql, 002_users.sql
--
-- CATATAN REVISI:
-- 1. announcements DEPRECATED - CRUD lokal tidak aktif, sumber data
--    pindah jadi proxy read-only dari SID (Roadmap Tahap 2 S2.1 #3-4).
--    Tabel dipertahankan di skema (tidak dihapus fisik), tidak dipakai
--    aktif - konsisten dengan keputusan yang sama di level database.
-- 2. emergency_contacts: tambah kolom is_core (FS-03, hybrid kontak
--    inti/tambahan) - SUDAH LIVE di Prisma dengan nama ini persis.
-- 3. preparedness_guides DITAMBAHKAN (FS-05) - SUDAH LIVE di Prisma,
--    sebelumnya tidak ada di domain ini sama sekali.
-- =====================================================================

-- DEPRECATED - lihat catatan di atas. Dipertahankan untuk kompatibilitas
-- skema historis, tidak menerima tulisan baru sejak Roadmap Tahap 2.
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Belum live di database nyata (Prisma) - murni desain.
CREATE TABLE evacuation_points (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  latitude    NUMERIC(9,6) NOT NULL,
  longitude   NUMERIC(9,6) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Belum live di database nyata (Prisma) - murni desain.
CREATE TABLE evacuation_routes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name  VARCHAR(255) NOT NULL,
  geometry    JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LIVE - cocok dengan Prisma (seluruh nama kolom snake_case via @map eksplisit).
CREATE TABLE emergency_contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution  VARCHAR(255) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  is_core      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LIVE (baru ditambahkan ke dokumen ini) - cocok dengan Prisma.
CREATE TYPE guide_source_type AS ENUM ('RESMI', 'MITRA');

CREATE TABLE preparedness_guides (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  content      TEXT,
  external_url TEXT,
  source_type  guide_source_type NOT NULL DEFAULT 'RESMI',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_content_or_url CHECK (content IS NOT NULL OR external_url IS NOT NULL)
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

CREATE TRIGGER trg_preparedness_guides_updated_at
  BEFORE UPDATE ON preparedness_guides
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();