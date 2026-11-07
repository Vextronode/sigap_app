-- =====================================================================
-- 004_environmental.sql
-- SIGAP - Alert, gempa, dan notifikasi
-- Sumber: apps/backend/prisma/schema.prisma
-- =====================================================================

CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "level" "AlertLevel" NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT,
    "review_status" "alert_review_status" NOT NULL DEFAULT 'Belum Ditinjau',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

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

CREATE INDEX "alerts_review_status_idx" ON "alerts"("review_status");

CREATE INDEX "alerts_createdAt_idx" ON "alerts"("createdAt");

CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

CREATE INDEX "notification_logs_created_at_idx" ON "notification_logs"("created_at");

CREATE INDEX "notification_logs_alert_id_idx" ON "notification_logs"("alert_id");

CREATE UNIQUE INDEX "earthquake_records_eventTime_key" ON "earthquake_records"("eventTime");

ALTER TABLE "alerts" ADD CONSTRAINT "alerts_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
