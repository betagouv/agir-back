/*
  Warnings:

  - The `seen` column on the `Interaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "seen",
ADD COLUMN     "seen" INTEGER NOT NULL DEFAULT 0;
