/*
  Warnings:

  - You are about to drop the column `dashboardId` on the `Badge` table. All the data in the column will be lost.
  - You are about to drop the `Compteur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Dashboard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Badge" DROP CONSTRAINT "Badge_dashboardId_fkey";

-- DropForeignKey
ALTER TABLE "Compteur" DROP CONSTRAINT "Compteur_dashboardId_fkey";

-- DropForeignKey
ALTER TABLE "Dashboard" DROP CONSTRAINT "Dashboard_utilisateurId_fkey";

-- AlterTable
ALTER TABLE "Badge" DROP COLUMN "dashboardId",
ADD COLUMN     "utilisateurId" TEXT;

-- DropTable
DROP TABLE "Compteur";

-- DropTable
DROP TABLE "Dashboard";

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
