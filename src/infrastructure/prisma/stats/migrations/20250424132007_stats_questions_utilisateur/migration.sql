-- CreateTable
CREATE TABLE "QuestionsUtilisateur" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action_cms_id" TEXT NOT NULL,
    "action_titre" TEXT NOT NULL,
    "est_action_faite" BOOLEAN NOT NULL,
    "question" TEXT NOT NULL,
    "date_question" TEXT NOT NULL,

    CONSTRAINT "QuestionsUtilisateur_pkey" PRIMARY KEY ("id")
);
