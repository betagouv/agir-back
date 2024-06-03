-- AlterTable
ALTER TABLE "Defi" ADD COLUMN     "categorie" TEXT NOT NULL DEFAULT 'recommandation';

-- AlterTable
ALTER TABLE "Quizz" ADD COLUMN     "categorie" TEXT NOT NULL DEFAULT 'recommandation';
