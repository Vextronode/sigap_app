-- =====================================================================
-- 003_content_admin.sql
-- SIGAP - Konten Admin
-- Sumber: apps/backend/prisma/schema.prisma
-- =====================================================================

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
