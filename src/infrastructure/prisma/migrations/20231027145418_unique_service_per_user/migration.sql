/*
  Warnings:

  - A unique constraint covering the columns `[serviceDefinitionId,utilisateurId]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Service_serviceDefinitionId_utilisateurId_key" ON "Service"("serviceDefinitionId", "utilisateurId");
