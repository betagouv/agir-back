/*
  Warnings:

  - You are about to drop the column `derniere_activite` on the `Statistique` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Statistique" DROP COLUMN "derniere_activite";

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "derniere_activite" TIMESTAMP(3);
