-- DropForeignKey
ALTER TABLE "Empreinte" DROP CONSTRAINT "Empreinte_situationId_fkey";

-- AlterTable
ALTER TABLE "SituationNGC" ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
