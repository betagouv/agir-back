-- CreateTable
CREATE TABLE "QuizzHistory" (
    "id" TEXT NOT NULL,
    "quizzId" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "categorie" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "QuizzHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizzHistory" ADD CONSTRAINT "QuizzHistory_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
