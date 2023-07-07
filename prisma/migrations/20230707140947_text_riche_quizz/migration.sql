/*
  Warnings:

  - Added the required column `texte_riche_explication` to the `QuizzQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizzQuestion" ADD COLUMN     "texte_riche_explication" TEXT NOT NULL;
