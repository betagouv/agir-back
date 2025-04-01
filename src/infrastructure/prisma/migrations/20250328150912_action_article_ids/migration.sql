-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "articles_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
