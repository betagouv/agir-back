-- CreateTable
CREATE TABLE "Suivi" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "attributs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "valeurs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "computed_impact" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "Suivi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Suivi" ADD CONSTRAINT "Suivi_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
