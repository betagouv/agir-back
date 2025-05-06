/*
  Warnings:

  - You are about to drop the column `tags_exclusion` on the `Personnalisation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Personnalisation" DROP COLUMN "tags_exclusion",
ADD COLUMN     "tags" TEXT[];
