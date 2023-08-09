/*
  Warnings:

  - A unique constraint covering the columns `[utilisateurId]` on the table `Dashboard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `utilisateurId` to the `Dashboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dashboard" ADD COLUMN     "utilisateurId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Dashboard_utilisateurId_key" ON "Dashboard"("utilisateurId");

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
