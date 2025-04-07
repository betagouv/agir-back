-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "codes_departement_from_partenaire" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "codes_region_from_partenaire" TEXT[] DEFAULT ARRAY[]::TEXT[];
