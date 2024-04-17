/*
  Warnings:

  - You are about to drop the column `ponderationId` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `ponderation_tags` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the `PonderationRubriques` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "ponderationId",
DROP COLUMN "ponderation_tags",
ADD COLUMN     "tag_ponderation_set" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "PonderationRubriques";
