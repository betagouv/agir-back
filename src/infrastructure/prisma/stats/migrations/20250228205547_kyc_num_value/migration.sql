/*
  Warnings:

  - You are about to drop the column `reponse_numeric` on the `KYCCopy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "KYCCopy" DROP COLUMN "reponse_numeric",
ADD COLUMN     "reponse_decimal" TEXT,
ADD COLUMN     "reponse_entier" INTEGER;
