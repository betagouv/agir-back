/*
  Warnings:

  - A unique constraint covering the columns `[utilisateurId]` on the table `Linky` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Linky" ADD COLUMN     "utilisateurId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Linky_utilisateurId_key" ON "Linky"("utilisateurId");
