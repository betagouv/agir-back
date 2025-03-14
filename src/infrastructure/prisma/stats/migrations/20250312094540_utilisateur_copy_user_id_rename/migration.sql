/*
  Warnings:

  - The primary key for the `UtilisateurCopy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UtilisateurCopy` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `UtilisateurCopy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UtilisateurCopy" RENAME COLUMN  "id" TO  "user_id";
