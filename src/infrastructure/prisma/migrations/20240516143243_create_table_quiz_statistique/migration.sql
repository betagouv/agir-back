-- CreateTable
CREATE TABLE "QuizStatistique" (
    "quizId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "nombre_de_bonne_reponse" INTEGER NOT NULL,
    "nombre_de_mauvaise_reponse" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "QuizStatistique_pkey" PRIMARY KEY ("quizId")
);
