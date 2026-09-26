-- Session Hardening
-- Login lockout fields
ALTER TABLE "users"
ADD COLUMN "failed_login_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "last_failed_login_at" TIMESTAMP(3),
ADD COLUMN "locked_until" TIMESTAMP(3);

-- JWT revoked token blocklist
CREATE TABLE "revoked_tokens" (
    "id" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "revoked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revoked_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "revoked_tokens_jti_key"
ON "revoked_tokens"("jti");

CREATE INDEX "revoked_tokens_jti_idx"
ON "revoked_tokens"("jti");

CREATE INDEX "revoked_tokens_expires_at_idx"
ON "revoked_tokens"("expires_at");

ALTER TABLE "revoked_tokens"
ADD CONSTRAINT "revoked_tokens_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;