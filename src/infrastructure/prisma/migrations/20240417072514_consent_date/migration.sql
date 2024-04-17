/*
  Warnings:

  - Changed the type of `date_consentement` on the `LinkyConsentement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date_fin_consentement` on the `LinkyConsentement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "LinkyConsentement" DROP COLUMN "date_consentement",
ADD COLUMN     "date_consentement" TIMESTAMP(3) NOT NULL,
DROP COLUMN "date_fin_consentement",
ADD COLUMN     "date_fin_consentement" TIMESTAMP(3) NOT NULL;
