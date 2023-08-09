/*
  Warnings:

  - Added the required column `dashboardId` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "dashboardId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Dashboard" ADD COLUMN     "doneQuizz" TEXT[],
ADD COLUMN     "todoQuizz" TEXT[];

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
