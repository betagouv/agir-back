/*
  Warnings:

  - You are about to drop the column `partenaire` on the `Action` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Action" DROP COLUMN "partenaire",
ADD COLUMN     "partenaire_id" TEXT;
