/*
  Warnings:

  - You are about to drop the column `bonus` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `poids` on the `Tag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "bonus",
DROP COLUMN "poids",
ADD COLUMN     "boost" DECIMAL(65,30),
ADD COLUMN     "ponderation" DECIMAL(65,30);
