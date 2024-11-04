/*
  Warnings:

  - The primary key for the `Thematique` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Thematique` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Thematique" DROP CONSTRAINT "Thematique_pkey",
DROP COLUMN "id",
ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "titre" DROP NOT NULL,
ALTER COLUMN "code" SET DEFAULT 'missing';
