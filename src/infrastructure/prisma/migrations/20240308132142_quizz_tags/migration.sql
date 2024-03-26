-- AlterTable
ALTER TABLE "Quizz" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
