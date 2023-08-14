/*
  Warnings:

  - You are about to drop the column `situation` on the `Empreinte` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[situationId]` on the table `Empreinte` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `situationId` to the `Empreinte` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Empreinte" DROP COLUMN "situation",
ADD COLUMN     "situationId" TEXT NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SituationNGC" (
    "id" TEXT NOT NULL,
    "situation" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SituationNGC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empreinte_situationId_key" ON "Empreinte"("situationId");

-- AddForeignKey
ALTER TABLE "Empreinte" ADD CONSTRAINT "Empreinte_situationId_fkey" FOREIGN KEY ("situationId") REFERENCES "SituationNGC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
