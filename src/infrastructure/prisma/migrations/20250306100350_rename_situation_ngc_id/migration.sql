/*
  Warnings:

  - You are about to drop the column `situationNgcId` on the `OIDC_STATE` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OIDC_STATE" DROP COLUMN "situationNgcId",
ADD COLUMN     "situation_ngc_id" TEXT;
