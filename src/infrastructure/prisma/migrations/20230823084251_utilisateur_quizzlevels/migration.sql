/*
  Warnings:

  - You are about to drop the column `quizzDifficulty` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "quizzDifficulty",
ADD COLUMN     "quizzLevels" JSONB NOT NULL DEFAULT '{}';
