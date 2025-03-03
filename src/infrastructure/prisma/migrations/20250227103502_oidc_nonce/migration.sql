/*
  Warnings:

  - A unique constraint covering the columns `[nonce]` on the table `OIDC_STATE` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OIDC_STATE" ADD COLUMN     "nonce" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OIDC_STATE_nonce_key" ON "OIDC_STATE"("nonce");
