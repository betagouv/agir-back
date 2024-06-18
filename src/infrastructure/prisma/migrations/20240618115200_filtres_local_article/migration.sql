-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "codes_departement" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "codes_region" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "exclude_codes_commune" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "include_codes_commune" TEXT[] DEFAULT ARRAY[]::TEXT[];
