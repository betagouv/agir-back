-- CreateTable
CREATE TABLE "CommunesAndEPCI" (
    "code_insee" TEXT NOT NULL,
    "code_postaux" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_epci" BOOLEAN NOT NULL,
    "is_commune" BOOLEAN NOT NULL,
    "type_epci" TEXT,
    "nom" TEXT NOT NULL,

    CONSTRAINT "CommunesAndEPCI_pkey" PRIMARY KEY ("code_insee")
);
