-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "prevent_sendcode_before" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sent_code_count" INTEGER NOT NULL DEFAULT 0;
