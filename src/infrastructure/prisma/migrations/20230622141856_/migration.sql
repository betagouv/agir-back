-- CreateTable
CREATE TABLE "Empreinte" (
    "id" TEXT NOT NULL,
    "initial" BOOLEAN NOT NULL DEFAULT true,
    "situation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "Empreinte_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Empreinte" ADD CONSTRAINT "Empreinte_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
