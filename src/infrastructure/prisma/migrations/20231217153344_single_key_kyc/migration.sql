/*
  Warnings:

  - The primary key for the `QuestionsKYC` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `QuestionsKYC` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "QuestionsKYC_utilisateurId_key";

-- AlterTable
ALTER TABLE "QuestionsKYC" DROP CONSTRAINT "QuestionsKYC_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "QuestionsKYC_pkey" PRIMARY KEY ("utilisateurId");
