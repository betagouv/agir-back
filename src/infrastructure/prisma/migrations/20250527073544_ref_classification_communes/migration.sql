-- CreateTable
CREATE TABLE "ClassificationCommune" (
    "code_commune" TEXT NOT NULL,
    "classification" TEXT,
    "CATEAAV2020" INTEGER,
    "TAAV2017" INTEGER,
    "est_drom" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ClassificationCommune_pkey" PRIMARY KEY ("code_commune")
);
