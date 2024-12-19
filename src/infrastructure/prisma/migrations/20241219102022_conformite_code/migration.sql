/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Conformite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Conformite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conformite" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conformite_code_key" ON "Conformite"("code");
