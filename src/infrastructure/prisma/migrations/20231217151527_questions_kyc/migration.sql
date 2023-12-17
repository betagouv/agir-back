-- CreateTable
CREATE TABLE "QuestionsKYC" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionsKYC_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionsKYC" ADD CONSTRAINT "QuestionsKYC_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
