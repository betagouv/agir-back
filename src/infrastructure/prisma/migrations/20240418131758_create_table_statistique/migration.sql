-- CreateTable
CREATE TABLE "Statistique" (
    "utilisateurId" TEXT NOT NULL,
    "nombre_defis_realises" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Statistique_pkey" PRIMARY KEY ("utilisateurId")
);
