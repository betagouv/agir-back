/*
  Warnings:

  - A unique constraint covering the columns `[utilisateurId]` on the table `OIDC_STATE` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OIDC_STATE" ADD COLUMN     "utilisateurId" TEXT;

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OIDC_STATE_utilisateurId_key" ON "OIDC_STATE"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");
