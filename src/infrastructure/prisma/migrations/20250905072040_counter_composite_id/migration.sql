/*
  Warnings:

  - You are about to drop the column `type` on the `OfflineCounter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[composite_id]` on the table `OfflineCounter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type_contenu` to the `OfflineCounter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OfflineCounter" DROP COLUMN "type",
ADD COLUMN     "composite_id" TEXT,
ADD COLUMN     "type_contenu" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OfflineCounter_composite_id_key" ON "OfflineCounter"("composite_id");
