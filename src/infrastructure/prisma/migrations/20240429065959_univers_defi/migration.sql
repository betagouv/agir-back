-- AlterTable
ALTER TABLE "Defi" ADD COLUMN     "thematiquesUnivers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "universes" TEXT[] DEFAULT ARRAY[]::TEXT[];
