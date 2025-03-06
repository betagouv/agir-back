/*
  Warnings:

  - The `unite` column on the `KYC` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "KYC" DROP COLUMN "unite",
ADD COLUMN     "unite" JSONB;
