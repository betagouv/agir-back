-- CreateTable
CREATE TABLE "BilanCarboneStatistique" (
    "utilisateurId" TEXT NOT NULL,
    "situation" JSONB NOT NULL,
    "total_g" INTEGER NOT NULL,
    "transport_g" INTEGER NOT NULL,
    "alimenation_g" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BilanCarboneStatistique_pkey" PRIMARY KEY ("utilisateurId")
);
