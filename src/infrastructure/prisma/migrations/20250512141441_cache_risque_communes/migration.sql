-- CreateTable
CREATE TABLE "RisquesNaturelsCommunes" (
    "code_commune" TEXT NOT NULL,
    "surface_totale" INTEGER,
    "secheresse_surface_zone1" INTEGER,
    "secheresse_surface_zone2" INTEGER,
    "secheresse_surface_zone3" INTEGER,
    "secheresse_surface_zone4" INTEGER,
    "secheresse_surface_zone5" INTEGER,
    "inondation_surface_zone1" INTEGER,
    "inondation_surface_zone2" INTEGER,
    "inondation_surface_zone3" INTEGER,
    "inondation_surface_zone4" INTEGER,
    "inondation_surface_zone5" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RisquesNaturelsCommunes_pkey" PRIMARY KEY ("code_commune")
);
