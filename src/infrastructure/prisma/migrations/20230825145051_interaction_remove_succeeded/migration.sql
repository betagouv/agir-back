/*
  Warnings:

  - You are about to drop the column `succeeded` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `succeeded_at` on the `Interaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "succeeded",
DROP COLUMN "succeeded_at";
