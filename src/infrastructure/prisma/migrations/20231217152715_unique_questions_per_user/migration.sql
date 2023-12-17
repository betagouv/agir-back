/*
  Warnings:

  - A unique constraint covering the columns `[utilisateurId]` on the table `QuestionsKYC` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "QuestionsKYC_utilisateurId_key" ON "QuestionsKYC"("utilisateurId");
