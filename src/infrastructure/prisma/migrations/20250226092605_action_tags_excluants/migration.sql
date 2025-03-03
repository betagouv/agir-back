-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "tags_excluants" TEXT[] DEFAULT ARRAY[]::TEXT[];
