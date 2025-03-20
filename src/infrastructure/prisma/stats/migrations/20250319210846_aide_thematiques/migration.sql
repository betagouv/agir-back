/*
  Warnings:

  - You are about to drop the column `thematique` on the `AideCopy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AideCopy" DROP COLUMN "thematique",
ADD COLUMN     "thematiques" TEXT[];
