/*
  Warnings:

  - You are about to drop the column `code_postal_classement` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `commune_classement` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "code_postal_classement",
DROP COLUMN "commune_classement";
