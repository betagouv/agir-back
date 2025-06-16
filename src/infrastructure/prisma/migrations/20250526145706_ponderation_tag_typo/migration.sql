/*
  Warnings:

  - You are about to drop the column `bonuse` on the `PonderationTags` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PonderationTags" DROP COLUMN "bonuse",
ADD COLUMN     "bonus" DECIMAL(65,30);
