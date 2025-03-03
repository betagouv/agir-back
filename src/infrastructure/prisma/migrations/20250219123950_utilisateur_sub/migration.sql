/*
  Warnings:

  - A unique constraint covering the columns `[france_connect_sub]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "france_connect_sub" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_france_connect_sub_key" ON "Utilisateur"("france_connect_sub");
