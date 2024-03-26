-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
