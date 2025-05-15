/*
  Warnings:

  - You are about to drop the column `magiclink_count` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `prevent_magiclink_before` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "magiclink_count",
DROP COLUMN "prevent_magiclink_before";
