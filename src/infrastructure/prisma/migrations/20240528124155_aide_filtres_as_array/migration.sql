/*
  Warnings:

  - The `codes_departement` column on the `Aide` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `codes_region` column on the `Aide` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `exclude_codes_commune` column on the `Aide` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `include_codes_commune` column on the `Aide` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Aide" DROP COLUMN "codes_departement",
ADD COLUMN     "codes_departement" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "codes_region",
ADD COLUMN     "codes_region" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "exclude_codes_commune",
ADD COLUMN     "exclude_codes_commune" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "include_codes_commune",
ADD COLUMN     "include_codes_commune" TEXT[] DEFAULT ARRAY[]::TEXT[];
