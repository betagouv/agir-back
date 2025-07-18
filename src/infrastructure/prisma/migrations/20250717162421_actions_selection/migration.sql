-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "selections" TEXT[] DEFAULT ARRAY[]::TEXT[];
