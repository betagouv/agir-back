/*
  Warnings:

  - You are about to drop the `QuestionsKYC` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionsKYC" DROP CONSTRAINT "QuestionsKYC_utilisateurId_fkey";

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "kyc" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "QuestionsKYC";
