/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `Badge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Made the column `utilisateurId` on table `Badge` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Badge" DROP CONSTRAINT "Badge_utilisateurId_fkey";

-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "utilisateurId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Badge_type_key" ON "Badge"("type");

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
