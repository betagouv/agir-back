-- CreateTable
CREATE TABLE "Quizz" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,

    CONSTRAINT "Quizz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizzQuestion" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "propositions" TEXT[],
    "solution" TEXT NOT NULL,
    "quizzId" TEXT NOT NULL,

    CONSTRAINT "QuizzQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizzQuestion" ADD CONSTRAINT "QuizzQuestion_quizzId_fkey" FOREIGN KEY ("quizzId") REFERENCES "Quizz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
