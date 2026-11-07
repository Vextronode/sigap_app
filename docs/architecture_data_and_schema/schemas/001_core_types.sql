-- =====================================================================
-- 001_core_types.sql
-- SIGAP - Tipe enum
-- Sumber: apps/backend/prisma/schema.prisma
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE');

CREATE TYPE "AlertLevel" AS ENUM ('GREEN', 'YELLOW', 'ORANGE', 'RED');

CREATE TYPE "alert_review_status" AS ENUM ('Belum Ditinjau', 'Dikonfirmasi', 'Ditolak', 'Ditindaklanjuti');

CREATE TYPE "GuideSourceType" AS ENUM ('RESMI', 'MITRA');
