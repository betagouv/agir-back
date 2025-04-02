/*
  Warnings:

  - You are about to drop the column `pourcentage_progression_alimenation` on the `BilanCarbone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BilanCarbone" DROP COLUMN "pourcentage_progression_alimenation",
ADD COLUMN     "pourcentage_progression_alimentation" INTEGER NOT NULL DEFAULT 0;
