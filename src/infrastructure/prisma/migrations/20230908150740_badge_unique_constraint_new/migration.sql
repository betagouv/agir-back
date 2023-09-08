/*
  Warnings:

  - A unique constraint covering the columns `[type,utilisateurId]` on the table `Badge` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Badge_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "Badge_type_utilisateurId_key" ON "Badge"("type", "utilisateurId");
