/*
  Warnings:

  - The primary key for the `Conformite` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Conformite" DROP CONSTRAINT "Conformite_pkey",
ALTER COLUMN "id_cms" SET DATA TYPE TEXT,
ADD CONSTRAINT "Conformite_pkey" PRIMARY KEY ("id_cms");
