/*
  Warnings:

  - A unique constraint covering the columns `[external_stat_id]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "external_stat_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_external_stat_id_key" ON "Utilisateur"("external_stat_id");
