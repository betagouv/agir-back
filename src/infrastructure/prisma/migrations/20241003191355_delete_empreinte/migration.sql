/*
  Warnings:

  - You are about to drop the `Empreinte` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Empreinte" DROP CONSTRAINT "Empreinte_utilisateurId_fkey";

-- DropTable
DROP TABLE "Empreinte";
