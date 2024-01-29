/*
  Warnings:

  - You are about to drop the `Interaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InteractionDefinition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_utilisateurId_fkey";

-- DropTable
DROP TABLE "Interaction";

-- DropTable
DROP TABLE "InteractionDefinition";
