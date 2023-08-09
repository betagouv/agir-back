-- CreateTable
CREATE TABLE "Compteur" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "valeur" INTEGER NOT NULL,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "Compteur_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Compteur" ADD CONSTRAINT "Compteur_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
