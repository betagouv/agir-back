/*
  Warnings:

  - You are about to drop the `Ponderation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Ponderation";

-- CreateTable
CREATE TABLE "PonderationRubriques" (
    "id" TEXT NOT NULL,
    "rubriques" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "PonderationRubriques_pkey" PRIMARY KEY ("id")
);
