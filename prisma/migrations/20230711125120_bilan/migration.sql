/*
  Warnings:

  - The `situation` column on the `Empreinte` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Empreinte" ADD COLUMN     "bilan" JSONB,
DROP COLUMN "situation",
ADD COLUMN     "situation" JSONB;
