/*
  Warnings:

  - You are about to drop the column `code_commune` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" RENAME COLUMN "code_commune" TO "code_commune_classement";
