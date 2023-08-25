/*
  Warnings:

  - You are about to drop the `QuizzHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quizzScore` to the `Interaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuizzHistory" DROP CONSTRAINT "QuizzHistory_utilisateurId_fkey";

-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN     "quizzScore" INTEGER NOT NULL;

-- DropTable
DROP TABLE "QuizzHistory";
