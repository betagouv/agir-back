/*
  Warnings:

  - A unique constraint covering the columns `[prm]` on the table `Linky` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Linky_prm_key" ON "Linky"("prm");
