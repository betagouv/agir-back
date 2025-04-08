/*
  Warnings:

  - You are about to drop the column `codes_commune` on the `Aide` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Aide" DROP COLUMN "codes_commune",
ADD COLUMN     "codes_commune_from_partenaire" TEXT[] DEFAULT ARRAY[]::TEXT[];
