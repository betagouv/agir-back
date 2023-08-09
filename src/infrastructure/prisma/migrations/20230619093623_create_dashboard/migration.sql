/*
  Warnings:

  - You are about to drop the column `utilisateurId` on the `Compteur` table. All the data in the column will be lost.
  - Added the required column `dashboardId` to the `Compteur` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Compteur" DROP CONSTRAINT "Compteur_utilisateurId_fkey";

-- AlterTable
ALTER TABLE "Compteur" DROP COLUMN "utilisateurId",
ADD COLUMN     "dashboardId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Compteur" ADD CONSTRAINT "Compteur_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
