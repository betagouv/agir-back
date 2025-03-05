/*
  Warnings:

  - You are about to drop the column `kyc_ids` on the `Action` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Action" DROP COLUMN "kyc_ids",
ADD COLUMN     "kyc_codes" TEXT[] DEFAULT ARRAY[]::TEXT[];
