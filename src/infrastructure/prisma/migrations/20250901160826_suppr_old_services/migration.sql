/*
  Warnings:

  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceDefinition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_serviceDefinitionId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_utilisateurId_fkey";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "ServiceDefinition";
