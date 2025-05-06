-- AlterTable
ALTER TABLE "ActionCopy" ADD COLUMN     "dates_partages" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[];
