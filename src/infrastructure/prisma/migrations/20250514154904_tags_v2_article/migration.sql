-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "tags_a_exclure_v2" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tags_a_inclure_v2" TEXT[] DEFAULT ARRAY[]::TEXT[];
