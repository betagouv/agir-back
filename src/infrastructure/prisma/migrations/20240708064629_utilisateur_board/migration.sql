-- CreateTable
CREATE TABLE "UtilisateurBoard" (
    "utilisateurId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "code_postal" TEXT,
    "commune" TEXT,
    "prenom" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UtilisateurBoard_pkey" PRIMARY KEY ("utilisateurId")
);
