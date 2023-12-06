/*
  Warnings:

  - You are about to drop the column `pk_winter` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Linky" ADD COLUMN     "pk_winter" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "pk_winter";
