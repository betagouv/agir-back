-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN     "codes_postaux" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "InteractionDefinition" ADD COLUMN     "codes_postaux" TEXT[] DEFAULT ARRAY[]::TEXT[];
