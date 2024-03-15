/*
  Warnings:

  - You are about to drop the column `tags` on the `Quizz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quizz" DROP COLUMN "tags",
ADD COLUMN     "tags_utilisateur" TEXT[] DEFAULT ARRAY[]::TEXT[];
