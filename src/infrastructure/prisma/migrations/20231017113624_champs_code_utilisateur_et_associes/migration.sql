-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "active_account" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "failed_checkcode_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prevent_checkcode_before" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
