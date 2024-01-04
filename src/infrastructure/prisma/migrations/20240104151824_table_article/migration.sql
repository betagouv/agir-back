-- CreateTable
CREATE TABLE "Article" (
    "content_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "soustitre" TEXT,
    "source" TEXT,
    "image_url" TEXT,
    "partenaire_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rubrique_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rubrique_labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "codes_postaux" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "duree" TEXT,
    "frequence" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 0,
    "thematique_gamification" TEXT,
    "thematiques" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("content_id")
);
