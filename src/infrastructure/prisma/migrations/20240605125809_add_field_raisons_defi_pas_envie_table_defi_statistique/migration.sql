-- AlterTable
ALTER TABLE "DefiStatistique" ADD COLUMN     "raisons_defi_pas_envie" TEXT[] DEFAULT ARRAY[]::TEXT[];
