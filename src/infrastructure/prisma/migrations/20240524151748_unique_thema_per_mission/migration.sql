/*
  Warnings:

  - A unique constraint covering the columns `[thematique_univers]` on the table `Mission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Mission_thematique_univers_key" ON "Mission"("thematique_univers");
