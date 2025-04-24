/*
  Warnings:

  - The `date_question` column on the `QuestionsUtilisateur` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "QuestionsUtilisateur" DROP COLUMN "date_question",
ADD COLUMN     "date_question" TIMESTAMPTZ(3);
