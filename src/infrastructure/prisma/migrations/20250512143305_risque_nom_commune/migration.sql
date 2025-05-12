/*
  Warnings:

  - Added the required column `nom_commune` to the `RisquesNaturelsCommunes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RisquesNaturelsCommunes" ADD COLUMN     "nom_commune" TEXT NOT NULL;
