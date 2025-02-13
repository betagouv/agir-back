/*
  Warnings:

  - You are about to drop the column `nonce` on the `OIDC_STATE` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OIDC_STATE" DROP COLUMN "nonce";
