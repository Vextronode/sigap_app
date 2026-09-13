-- =====================================================================
-- 002_users.sql
-- SIGAP - Domain: Users
-- Bergantung pada: 001_core_types.sql
--
-- CATATAN REVISI: kolom `role` (single-value) DIHAPUS - digantikan
-- struktur RBAC penuh (roles/permissions/role_permissions/user_roles),
-- lihat 006_rbac.sql dan ADR-006. File ini sebelumnya menyimpan role
-- sebagai kolom tunggal dengan default 'admin_operator' sebagai
-- placeholder sementara - keputusan itu sudah final digantikan.
--
-- PERLU VERIFIKASI: nama kolom `password` di bawah ini BELUM
-- dikonfirmasi terhadap database nyata (Prisma tidak memakai @map
-- eksplisit, kemungkinan besar kolom asli juga `password`, bukan
-- `password_hash` seperti versi sebelumnya) - konfirmasi via
-- information_schema sebelum dianggap final.
-- =====================================================================

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    TEXT NOT NULL, -- PERLU VERIFIKASI nama kolom, lihat catatan di atas
  createdAt  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();