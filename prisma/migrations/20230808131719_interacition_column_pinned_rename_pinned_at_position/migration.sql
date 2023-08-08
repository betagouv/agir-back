/*
  Warnings:

  - You are about to drop the column `pinned` on the `Interaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "pinned",
ADD COLUMN     "pinned_at_position" INTEGER;
