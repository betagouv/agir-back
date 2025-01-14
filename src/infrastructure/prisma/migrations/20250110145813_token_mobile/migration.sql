/*
  Warnings:

  - A unique constraint covering the columns `[mobile_token]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "mobile_token" TEXT,
ADD COLUMN     "mobile_token_updated_at" TIMESTAMPTZ(3);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_mobile_token_key" ON "Utilisateur"("mobile_token");
