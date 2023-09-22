/*
  Warnings:

  - You are about to drop the `Quizz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizzQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuizzQuestion" DROP CONSTRAINT "QuizzQuestion_quizzId_fkey";

-- DropTable
DROP TABLE "Quizz";

-- DropTable
DROP TABLE "QuizzQuestion";
