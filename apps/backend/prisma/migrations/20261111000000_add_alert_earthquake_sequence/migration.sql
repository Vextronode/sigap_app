-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "episode_event_count" INTEGER,
ADD COLUMN     "episode_max_magnitude" DOUBLE PRECISION,
ADD COLUMN     "episode_started_at" TIMESTAMP(3),
ADD COLUMN     "event_time" TIMESTAMP(3),
ADD COLUMN     "reference_magnitude" DOUBLE PRECISION;
