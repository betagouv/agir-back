-- AlterTable
ALTER TABLE "UtilisateurCopy" ADD COLUMN     "date_inscription" TIMESTAMPTZ(3),
ALTER COLUMN "date_derniere_activite" SET DATA TYPE TIMESTAMPTZ(3);
