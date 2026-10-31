-- Baseline: menyamakan riwayat migrasi dengan prisma/schema.prisma.
--
-- Dihasilkan otomatis (bukan ditulis tangan) dengan:
--   prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
-- terhadap DB PostgreSQL kosong yang sudah menerapkan tiga migrasi sebelumnya.
-- Tabel/kolom di bawah selama ini hanya ada di DB yang skemanya dibentuk lewat
-- `prisma db push`, sehingga DB baru dari `prisma migrate deploy` tidak lengkap.
-- Isinya aditif: tidak ada DROP atau perubahan tipe kolom.
--
-- DB lama yang SUDAH memiliki semua objek ini (dibentuk lewat db push) jangan
-- menjalankan SQL ini; tandai sebagai sudah diterapkan setelah memastikan tidak ada selisih:
--   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
--   npx prisma migrate resolve --applied 20261101000000_baseline_sync_schema

-- CreateEnum
CREATE TYPE "alert_review_status" AS ENUM ('Belum Ditinjau', 'Dikonfirmasi', 'Ditolak', 'Ditindaklanjuti');

-- CreateEnum
CREATE TYPE "GuideSourceType" AS ENUM ('RESMI', 'MITRA');

-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "review_status" "alert_review_status" NOT NULL DEFAULT 'Belum Ditinjau',
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "last_login_ip" TEXT;

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "alert_id" TEXT,
    "level" "AlertLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "triggered_by" TEXT NOT NULL DEFAULT 'CRON_SCHEDULER',
    "total_subscribers" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "error_details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earthquake_records" (
    "id" TEXT NOT NULL,
    "eventTime" TEXT NOT NULL,
    "magnitude" DOUBLE PRECISION NOT NULL,
    "depth" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distanceToVillage" DOUBLE PRECISION NOT NULL,
    "felt" TEXT,
    "potential" TEXT,
    "shakemap" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earthquake_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preparedness_guides" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "external_url" TEXT,
    "image_url" TEXT,
    "source_type" "GuideSourceType" NOT NULL DEFAULT 'RESMI',
    "source_label" TEXT DEFAULT 'Pemerintah Desa Cibenda',
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preparedness_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evacuation_points" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "elevation" DOUBLE PRECISION,
    "capacity" INTEGER,
    "description" TEXT,
    "facilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evacuation_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "notification_logs_created_at_idx" ON "notification_logs"("created_at");

-- CreateIndex
CREATE INDEX "notification_logs_alert_id_idx" ON "notification_logs"("alert_id");

-- CreateIndex
CREATE UNIQUE INDEX "earthquake_records_eventTime_key" ON "earthquake_records"("eventTime");

-- CreateIndex
CREATE INDEX "alerts_review_status_idx" ON "alerts"("review_status");

-- CreateIndex
CREATE INDEX "alerts_createdAt_idx" ON "alerts"("createdAt");

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

