-- AlterTable
ALTER TABLE "Interaction" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "duree" DROP NOT NULL,
ALTER COLUMN "frequence" DROP NOT NULL;