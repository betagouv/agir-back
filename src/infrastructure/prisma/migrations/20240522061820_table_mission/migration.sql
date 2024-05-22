-- CreateTable
CREATE TABLE "Mission" (
    "id_cms" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "thematique_univers" TEXT NOT NULL,
    "univers_parent" TEXT,
    "objectifs" JSONB NOT NULL DEFAULT '{}',
    "prochaines_thematiques" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "est_visible" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Mission_id_cms_key" ON "Mission"("id_cms");
