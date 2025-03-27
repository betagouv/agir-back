-- CreateTable
CREATE TABLE "BilanCarbone" (
    "user_id" TEXT NOT NULL,
    "total_kg" INTEGER NOT NULL,
    "transport_kg" INTEGER NOT NULL,
    "alimentation_kg" INTEGER NOT NULL,
    "logement_kg" INTEGER NOT NULL,
    "consommation_kg" INTEGER NOT NULL,

    CONSTRAINT "BilanCarbone_pkey" PRIMARY KEY ("user_id")
);
