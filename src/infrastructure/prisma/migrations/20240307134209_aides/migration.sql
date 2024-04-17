-- CreateTable
CREATE TABLE "Aide" (
    "content_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "url_simulateur" TEXT,
    "is_simulateur" BOOLEAN,
    "codes_postaux" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "thematiques" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "montant_max" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Aide_pkey" PRIMARY KEY ("content_id")
);
