/*
  Warnings:

  - You are about to drop the column `thematiquesUnivers` on the `Defi` table. All the data in the column will be lost.
  - You are about to drop the column `universes` on the `Defi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Defi" DROP COLUMN "thematiquesUnivers",
DROP COLUMN "universes";
