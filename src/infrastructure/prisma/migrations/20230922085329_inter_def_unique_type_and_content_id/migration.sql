/*
  Warnings:

  - A unique constraint covering the columns `[type,content_id]` on the table `InteractionDefinition` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "InteractionDefinition_content_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "InteractionDefinition_type_content_id_key" ON "InteractionDefinition"("type", "content_id");
