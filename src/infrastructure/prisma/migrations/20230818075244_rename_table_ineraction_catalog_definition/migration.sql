/*
  Warnings:

  - You are about to drop the `InteractionCatalog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "InteractionCatalog";

-- CreateTable
CREATE TABLE "InteractionDefinition" (
    "id" TEXT NOT NULL,
    "content_id" TEXT,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "soustitre" TEXT,
    "categorie" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "duree" TEXT,
    "frequence" TEXT,
    "image_url" TEXT,
    "url" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 0,
    "reco_score" INTEGER NOT NULL DEFAULT 1000,
    "day_period" INTEGER,
    "pinned_at_position" INTEGER,
    "raison_lock" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InteractionDefinition_pkey" PRIMARY KEY ("id")
);
