-- =====================================================================
-- 006_rbac.sql
-- SIGAP — Domain: RBAC (Role-Based Access Control)
-- Bergantung pada: 002_users.sql (FK user_roles.user_id)
--
-- Ditambahkan sebagai hasil keputusan Tech Lead (Full RBAC) untuk
-- menggantikan kolom users.role (VARCHAR tunggal) yang sebelumnya ada.
-- Diposisikan nomor 006 (bukan 003) karena satu-satunya dependency-nya
-- adalah users — bisa dijalankan kapan pun setelah 002_users.sql.
-- =====================================================================

CREATE TABLE roles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(50) NOT NULL UNIQUE,
  description  TEXT
);

CREATE TABLE permissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         VARCHAR(100) NOT NULL UNIQUE, -- mis. 'content.manage', 'alert.validate'
  description  TEXT
);

CREATE TABLE role_permissions (
  role_id        UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id  UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id  UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ---------------------------------------------------------------------
-- Seed data awal — 2 role dasar sesuai kebutuhan tim saat ini:
-- admin (kelola konten & user) dan operator (verifikasi level & sirine).
-- Granularitas lebih lanjut bisa ditambah tanpa migrasi ulang struktur.
-- ---------------------------------------------------------------------

INSERT INTO roles (name, description) VALUES
  ('admin', 'Mengelola konten desa (pengumuman, evakuasi, kontak darurat) dan user'),
  ('operator', 'Memverifikasi level kesiapsiagaan dan mengelola aktivasi sirine');

INSERT INTO permissions (code, description) VALUES
  ('content.manage', 'Kelola pengumuman, titik/jalur evakuasi, kontak darurat'),
  ('alert.validate', 'Validasi alert yang masuk'),
  ('device.view', 'Lihat detail lengkap perangkat IoT & log status'),
  ('device.manage', 'Kelola (tambah/ubah/hapus) perangkat IoT'),
  ('siren.view', 'Lihat log aktivasi sirine'),
  ('siren.trigger', 'Memicu sirine — reserved, route aktual masih TBD (lihat 005_iot_kesiapsiagaan.sql)'),
  ('user.manage', 'Kelola akun user dan penugasan role');

-- admin: semua permission kecuali siren.trigger (yang tetap human-triggered fisik, bukan lewat panel admin)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' AND p.code IN
  ('content.manage', 'alert.validate', 'device.view', 'device.manage', 'siren.view', 'user.manage');

-- operator: hanya yang relevan dengan verifikasi level & sirine
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'operator' AND p.code IN
  ('alert.validate', 'device.view', 'siren.view', 'siren.trigger');
