-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "unlocked_features" JSONB NOT NULL DEFAULT '{}';
