/*
  Warnings:

  - You are about to drop the `PonderationTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PonderationTags";

-- CreateTable
CREATE TABLE "Tag" (
    "id_cms" TEXT NOT NULL,
    "tag" TEXT,
    "description" TEXT,
    "poids" DECIMAL(65,30),
    "bonus" DECIMAL(65,30),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id_cms")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tag_key" ON "Tag"("tag");
