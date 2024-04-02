/*
  Warnings:

  - You are about to drop the column `thematiques` on the `Defi` table. All the data in the column will be lost.
  - Added the required column `thematique` to the `Defi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Defi" DROP COLUMN "thematiques",
ADD COLUMN     "thematique" TEXT NOT NULL;
