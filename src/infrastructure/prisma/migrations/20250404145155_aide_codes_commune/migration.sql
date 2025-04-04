-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "codes_commune" TEXT[] DEFAULT ARRAY[]::TEXT[];
