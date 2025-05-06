-- AlterTable
ALTER TABLE "UtilisateurCopy" ADD COLUMN     "actif_le" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[];
