/*
  Warnings:

  - You are about to drop the column `version_ponderation` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "version_ponderation",
ADD COLUMN     "ponderationId" TEXT NOT NULL DEFAULT 'neutre';
