/*
  Warnings:

  - You are about to drop the column `mention_usage_donnees` on the `LinkyConsentement` table. All the data in the column will be lost.
  - You are about to drop the column `prenom` on the `LinkyConsentement` table. All the data in the column will be lost.
  - You are about to drop the column `type_donnees` on the `LinkyConsentement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LinkyConsentement" DROP COLUMN "mention_usage_donnees",
DROP COLUMN "prenom",
DROP COLUMN "type_donnees",
ADD COLUMN     "ip_address" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "user_agent" TEXT NOT NULL DEFAULT 'unknown';
