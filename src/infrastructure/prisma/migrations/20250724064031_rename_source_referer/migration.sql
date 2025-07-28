/*
  Warnings:

  - You are about to drop the column `source` on the `OIDC_STATE` table. All the data in the column will be lost.
  - You are about to drop the column `source_keyword` on the `OIDC_STATE` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `source_keyword` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OIDC_STATE" DROP COLUMN "source",
DROP COLUMN "source_keyword",
ADD COLUMN     "referer" TEXT,
ADD COLUMN     "referer_keyword" TEXT;

-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "source",
DROP COLUMN "source_keyword",
ADD COLUMN     "referer" TEXT,
ADD COLUMN     "referer_keyword" TEXT;
