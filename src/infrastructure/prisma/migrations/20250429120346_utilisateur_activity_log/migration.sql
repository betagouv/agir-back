-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "activity_dates_log" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[];
