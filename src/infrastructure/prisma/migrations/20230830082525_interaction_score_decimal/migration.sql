-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN     "score" DECIMAL(10,10) NOT NULL DEFAULT 0.5;

-- AlterTable
ALTER TABLE "InteractionDefinition" ADD COLUMN     "score" DECIMAL(10,10) NOT NULL DEFAULT 0.5;
