-- AlterTable
ALTER TABLE "Partenaire" ADD COLUMN     "liste_communes_calculees" TEXT[] DEFAULT ARRAY[]::TEXT[];
