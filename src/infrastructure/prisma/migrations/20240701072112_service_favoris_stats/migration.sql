-- CreateTable
CREATE TABLE "ServicesFavorisStatistique" (
    "service_id" TEXT NOT NULL,
    "favoris_id" TEXT NOT NULL,
    "titre_favoris" TEXT NOT NULL,
    "count_favoris" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ServicesFavorisStatistique_service_id_favoris_id_key" ON "ServicesFavorisStatistique"("service_id", "favoris_id");
