-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "codes_departement" TEXT,
ADD COLUMN     "codes_region" TEXT,
ADD COLUMN     "exclude_codes_commune" TEXT,
ADD COLUMN     "include_codes_commune" TEXT;
