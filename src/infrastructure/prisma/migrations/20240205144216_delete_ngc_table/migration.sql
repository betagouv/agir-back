/*
  Warnings:

  - You are about to drop the `QuestionNGC` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionNGC" DROP CONSTRAINT "QuestionNGC_utilisateurId_fkey";

-- DropTable
DROP TABLE "QuestionNGC";
