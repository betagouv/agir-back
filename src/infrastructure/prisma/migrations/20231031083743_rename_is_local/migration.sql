/*
  Warnings:

  - You are about to drop the column `local` on the `ServiceDefinition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceDefinition" DROP COLUMN "local",
ADD COLUMN     "is_local" BOOLEAN NOT NULL DEFAULT false;
