/*
  Warnings:

  - You are about to drop the column `is_magic_link_user` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "is_magic_link_user";
