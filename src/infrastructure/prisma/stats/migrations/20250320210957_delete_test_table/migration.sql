/*
  Warnings:

  - You are about to drop the `TestTable` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "UtilisateurCopy" ADD COLUMN     "code_departement" TEXT,
ADD COLUMN     "rang_commune" INTEGER,
ADD COLUMN     "rang_national" INTEGER;

-- DropTable
DROP TABLE "TestTable";
