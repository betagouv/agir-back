/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `KYC` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "KYC_code_key" ON "KYC"("code");
