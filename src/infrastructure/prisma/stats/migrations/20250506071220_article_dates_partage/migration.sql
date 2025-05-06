-- AlterTable
ALTER TABLE "ArticleCopy" ADD COLUMN     "dates_partages" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[];
