/*
  Warnings:

  - You are about to drop the column `onboardingData` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingResult` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "onboardingData",
DROP COLUMN "onboardingResult";
