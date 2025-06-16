-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "mode_inscription" TEXT,
ALTER COLUMN "source_inscription" SET DEFAULT 'inconnue';
