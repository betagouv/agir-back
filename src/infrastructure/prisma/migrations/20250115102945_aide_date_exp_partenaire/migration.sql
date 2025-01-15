-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "date_expiration" TIMESTAMPTZ(3),
ADD COLUMN     "partenaire_id" TEXT;
