/*
  Warnings:

  - A unique constraint covering the columns `[content_id]` on the table `InteractionDefinition` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InteractionDefinition_content_id_key" ON "InteractionDefinition"("content_id");
