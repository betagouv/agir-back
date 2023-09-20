/*
  Warnings:

  - You are about to drop the column `categorie` on the `InteractionDefinition` table. All the data in the column will be lost.
  - Added the required column `thematique_gamification` to the `InteractionDefinition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InteractionDefinition" RENAME COLUMN "categorie" TO "thematique_gamification";