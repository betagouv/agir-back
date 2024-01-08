-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "history" JSONB NOT NULL DEFAULT '{}';
