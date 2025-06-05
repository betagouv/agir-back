/*
  Warnings:

  - You are about to drop the column `inondation_surface_zone1` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.
  - You are about to drop the column `inondation_surface_zone2` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.
  - You are about to drop the column `inondation_surface_zone3` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.
  - You are about to drop the column `inondation_surface_zone4` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.
  - You are about to drop the column `inondation_surface_zone5` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.
  - You are about to drop the column `secheresse_surface_zone1` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.
  - You are about to drop the column `secheresse_surface_zone2` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.
  - You are about to drop the column `secheresse_surface_zone3` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.
  - You are about to drop the column `secheresse_surface_zone4` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.
  - You are about to drop the column `secheresse_surface_zone5` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.
  - You are about to drop the column `surface_totale` on the `RisquesNaturelsCommunes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RisquesNaturelsCommunes" DROP COLUMN "inondation_surface_zone1",
DROP COLUMN "inondation_surface_zone2",
DROP COLUMN "inondation_surface_zone3",
DROP COLUMN "inondation_surface_zone4",
DROP COLUMN "inondation_surface_zone5",
DROP COLUMN "secheresse_surface_zone1",
DROP COLUMN "secheresse_surface_zone2",
DROP COLUMN "secheresse_surface_zone3",
DROP COLUMN "secheresse_surface_zone4",
DROP COLUMN "secheresse_surface_zone5",
DROP COLUMN "surface_totale",
ADD COLUMN     "pourcentage_inondation" INTEGER,
ADD COLUMN     "pourcentage_secheresse" INTEGER;
