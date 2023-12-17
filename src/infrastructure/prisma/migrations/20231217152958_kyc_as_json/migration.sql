/*
  Warnings:

  - The `data` column on the `QuestionsKYC` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "QuestionsKYC" DROP COLUMN "data",
ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}';
