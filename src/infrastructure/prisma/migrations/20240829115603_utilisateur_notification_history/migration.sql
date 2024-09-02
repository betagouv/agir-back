-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "notification_history" JSONB NOT NULL DEFAULT '{}';
