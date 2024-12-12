-- AlterTable
ALTER TABLE "Quizz" ADD COLUMN     "article_id" TEXT,
ADD COLUMN     "questions" JSONB DEFAULT '{}';
