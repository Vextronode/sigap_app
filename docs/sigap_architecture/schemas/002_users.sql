-- =====================================================================
-- 002_users.sql
-- SIGAP - Domain: Users
-- Bergantung pada: 001_core_types.sql
-- =====================================================================

CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  -- TBD: permission matrix belum final (PRD SIGAP v4.0 §7.1).
  -- Sementara hanya satu role aktif; nilai lain ditambahkan setelah matrix disepakati.
  role           VARCHAR(50) NOT NULL DEFAULT 'admin_operator',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
