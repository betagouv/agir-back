/*
  Warnings:

  - You are about to drop the column `partenaire_ids` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "partenaire_ids",
ADD COLUMN     "partenaire" TEXT;
