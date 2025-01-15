-- CreateTable
CREATE TABLE "AideExpirationWarning" (
    "aide_cms_id" TEXT NOT NULL,
    "last_month" BOOLEAN NOT NULL,
    "last_month_sent" BOOLEAN NOT NULL,
    "last_week" BOOLEAN NOT NULL,
    "last_week_sent" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AideExpirationWarning_pkey" PRIMARY KEY ("aide_cms_id")
);
