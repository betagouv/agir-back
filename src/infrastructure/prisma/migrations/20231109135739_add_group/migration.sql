-- CreateTable
CREATE TABLE "Groupe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Groupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupeAbonnement" (
    "groupeId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupeAbonnement_pkey" PRIMARY KEY ("groupeId","utilisateurId")
);

-- AddForeignKey
ALTER TABLE "GroupeAbonnement" ADD CONSTRAINT "GroupeAbonnement_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupeAbonnement" ADD CONSTRAINT "GroupeAbonnement_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
