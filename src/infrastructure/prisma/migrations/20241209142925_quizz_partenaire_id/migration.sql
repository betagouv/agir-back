/*
  Warnings:

  - You are about to drop the column `partenaire` on the `Quizz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quizz" DROP COLUMN "partenaire",
ADD COLUMN     "partenaire_id" TEXT;
