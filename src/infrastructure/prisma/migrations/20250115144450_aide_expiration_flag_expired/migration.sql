-- AlterTable
ALTER TABLE "AideExpirationWarning" ADD COLUMN     "expired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "expired_sent" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "last_month" SET DEFAULT false,
ALTER COLUMN "last_week" SET DEFAULT false;
