/*
  Warnings:

  - You are about to drop the column `thematique_gamification` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `thematique_gamification` on the `Quizz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" RENAME COLUMN  "thematique_gamification" TO  "thematique_principale";

-- AlterTable
ALTER TABLE "Quizz" RENAME COLUMN  "thematique_gamification" TO  "thematique_principale";
