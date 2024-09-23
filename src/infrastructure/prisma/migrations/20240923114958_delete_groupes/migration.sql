/*
  Warnings:

  - You are about to drop the `Groupe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupeAbonnement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupeAbonnement" DROP CONSTRAINT "GroupeAbonnement_groupeId_fkey";

-- DropForeignKey
ALTER TABLE "GroupeAbonnement" DROP CONSTRAINT "GroupeAbonnement_utilisateurId_fkey";

-- DropTable
DROP TABLE "Groupe";

-- DropTable
DROP TABLE "GroupeAbonnement";
