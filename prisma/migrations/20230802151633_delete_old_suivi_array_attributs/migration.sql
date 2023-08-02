/*
  Warnings:

  - You are about to drop the column `attributs` on the `Suivi` table. All the data in the column will be lost.
  - You are about to drop the column `valeurs` on the `Suivi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Suivi" DROP COLUMN "attributs",
DROP COLUMN "valeurs";
