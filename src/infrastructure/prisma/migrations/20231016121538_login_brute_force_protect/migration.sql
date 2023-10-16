-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "failed_login_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prevent_login_before" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
