/*
  Warnings:

  - You are about to drop the column `reco_score` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `reco_score` on the `InteractionDefinition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "reco_score";

-- AlterTable
ALTER TABLE "InteractionDefinition" DROP COLUMN "reco_score";
