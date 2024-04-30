-- CreateTable
CREATE TABLE "DefiStatistique" (
    "content_id" TEXT NOT NULL,
    "titre" TEXT,
    "nombre_defis_realises" INTEGER,
    "nombre_defis_abandonnes" INTEGER,
    "nombre_defis_deja_fait" INTEGER,
    "nombre_defis_en_cours" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DefiStatistique_pkey" PRIMARY KEY ("content_id")
);
