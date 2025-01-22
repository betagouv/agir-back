-- AlterTable
ALTER TABLE "CommunesAndEPCI" ADD COLUMN     "codes_communes" TEXT[] DEFAULT ARRAY[]::TEXT[];
