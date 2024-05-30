-- CreateTable
CREATE TABLE "KYC" (
    "id_cms" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "is_ngc" BOOLEAN NOT NULL,
    "reponses" JSONB NOT NULL DEFAULT '{}',
    "thematique" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "universes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "KYC_id_cms_key" ON "KYC"("id_cms");
