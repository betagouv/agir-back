/*
  Warnings:

  - The primary key for the `Linky` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Linky` table. All the data in the column will be lost.
  - You are about to drop the column `pk_winter` on the `Linky` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Linky_prm_key";

-- AlterTable
ALTER TABLE "Linky" DROP CONSTRAINT "Linky_pkey",
DROP COLUMN "id",
DROP COLUMN "pk_winter",
ADD CONSTRAINT "Linky_pkey" PRIMARY KEY ("prm");
