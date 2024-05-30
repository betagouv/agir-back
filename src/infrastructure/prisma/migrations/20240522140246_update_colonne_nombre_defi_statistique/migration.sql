/*
  Warnings:

  - You are about to drop the column `nombre_defis_deja_fait` on the `DefiStatistique` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DefiStatistique" DROP COLUMN "nombre_defis_deja_fait",
ADD COLUMN     "nombre_defis_pas_envie" INTEGER;
