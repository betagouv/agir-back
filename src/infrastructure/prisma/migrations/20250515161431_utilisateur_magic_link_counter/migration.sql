-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "magiclink_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prevent_magiclink_before" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
