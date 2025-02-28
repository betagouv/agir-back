-- CreateTable
CREATE TABLE "UtilisateurCopy" (
    "id" TEXT NOT NULL,
    "compte_actif" BOOLEAN NOT NULL,
    "revenu_fiscal" INTEGER,
    "nombre_parts_fiscales" DECIMAL(4,2),
    "date_derniere_activite" TIMESTAMP(3),
    "nombre_points" INTEGER DEFAULT 0,
    "code_postal" TEXT,
    "nom_commune" TEXT,
    "code_insee_commune" TEXT,
    "source_inscription" TEXT,

    CONSTRAINT "UtilisateurCopy_pkey" PRIMARY KEY ("id")
);
