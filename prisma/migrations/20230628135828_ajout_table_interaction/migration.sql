-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "soustitre" TEXT,
    "categorie" TEXT NOT NULL,
    "tags" TEXT[],
    "duree" TEXT NOT NULL,
    "frequence" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "seen_at" TIMESTAMP(3),
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clicked_at" TIMESTAMP(3),
    "done" BOOLEAN NOT NULL DEFAULT false,
    "done_at" TIMESTAMP(3),
    "succeeded" BOOLEAN NOT NULL DEFAULT false,
    "succeeded_at" TIMESTAMP(3),
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 0,
    "reco_score" INTEGER NOT NULL DEFAULT 1000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
