-- AlterTable
ALTER TABLE "ServiceDefinition" ADD COLUMN     "thematiques" TEXT[] DEFAULT ARRAY[]::TEXT[];
