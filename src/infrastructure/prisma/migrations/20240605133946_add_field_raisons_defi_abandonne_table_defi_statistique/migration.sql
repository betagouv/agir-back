-- AlterTable
ALTER TABLE "DefiStatistique" ADD COLUMN     "raisons_defi_abandonne" TEXT[] DEFAULT ARRAY[]::TEXT[];
