/*
  Warnings:

  - You are about to drop the column `origin` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `origin_keyword` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "origin",
DROP COLUMN "origin_keyword",
ADD COLUMN     "source" TEXT,
ADD COLUMN     "source_keyword" TEXT;
