/*
  Warnings:

  - Added the required column `titre` to the `ArticleStatistique` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArticleStatistique" ADD COLUMN     "titre" TEXT NOT NULL;
