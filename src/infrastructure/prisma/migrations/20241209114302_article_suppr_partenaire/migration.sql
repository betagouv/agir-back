/*
  Warnings:

  - You are about to drop the column `partenaire` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `partenaire_logo_url` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `partenaire_url` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "partenaire",
DROP COLUMN "partenaire_logo_url",
DROP COLUMN "partenaire_url",
ADD COLUMN     "partenaire_id" TEXT;
