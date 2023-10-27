/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Service` table. All the data in the column will be lost.
  - Added the required column `serviceDefinitionId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_serviceId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "serviceId",
ADD COLUMN     "serviceDefinitionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceDefinitionId_fkey" FOREIGN KEY ("serviceDefinitionId") REFERENCES "ServiceDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
