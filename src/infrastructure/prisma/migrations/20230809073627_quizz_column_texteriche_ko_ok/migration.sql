/*
  Warnings:

  - You are about to drop the column `texte_riche_explication` on the `QuizzQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuizzQuestion" RENAME COLUMN  "texte_riche_explication" TO  "texte_riche_ko";
ALTER TABLE "QuizzQuestion" ADD COLUMN     "texte_riche_ok" TEXT NOT NULL DEFAULT '';
