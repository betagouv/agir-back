/*
  Warnings:

  - Changed the type of `id_cms` on the `Thematique` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Thematique" DROP COLUMN "id_cms",
ADD COLUMN     "id_cms" INTEGER NOT NULL;
