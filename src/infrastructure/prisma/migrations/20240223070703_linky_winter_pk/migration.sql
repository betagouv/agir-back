/*
  Warnings:

  - A unique constraint covering the columns `[winter_pk]` on the table `Linky` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Linky" ADD COLUMN     "winter_pk" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Linky_winter_pk_key" ON "Linky"("winter_pk");
