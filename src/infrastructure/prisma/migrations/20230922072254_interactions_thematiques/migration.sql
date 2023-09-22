-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN     "thematiques" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "InteractionDefinition" ADD COLUMN     "thematiques" TEXT[] DEFAULT ARRAY[]::TEXT[];
