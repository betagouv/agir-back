-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "faq_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
