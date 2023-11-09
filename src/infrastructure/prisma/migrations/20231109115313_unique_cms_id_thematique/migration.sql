/*
  Warnings:

  - A unique constraint covering the columns `[id_cms]` on the table `Thematique` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Thematique_id_cms_key" ON "Thematique"("id_cms");
