/*
  Warnings:

  - You are about to drop the `Suivi` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Suivi" DROP CONSTRAINT "Suivi_utilisateurId_fkey";

-- DropTable
DROP TABLE "Suivi";
